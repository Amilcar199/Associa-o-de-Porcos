export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { successResponse, errorResponse, sanitizeInput, isValidEmail } from '@/lib/api-utils';
import { sendEmail } from '@/lib/email';
import { BRAND_NAME } from '@/lib/brand'
import prisma from '@/lib/prisma'
import webpush from '@/lib/webpush'

// POST /api/auth/forgot-password - Solicitar recuperação de senha
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sanitizedData = sanitizeInput(body);

    // Validações
    if (!sanitizedData.email) {
      return errorResponse('Email é obrigatório');
    }

    if (!isValidEmail(sanitizedData.email)) {
      return errorResponse('Email inválido');
    }

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email: sanitizedData.email.toLowerCase() } });
    if (!user) {
      // Por segurança, não revelar se o email existe ou não
      return NextResponse.json(
        successResponse({}, 'Se o email existir, você receberá instruções de recuperação.')
      );
    }

    if (user.isActive === false) {
      return errorResponse('Conta desativada. Entre em contato com o suporte.');
    }

    // Gerar token de recuperação
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no usuário
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: resetTokenExpiry }
    })

    // Enviar email de recuperação
    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha?token=${resetToken}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Recuperação de Senha</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Olá, ${user.name}!</h2>
          <p>Você solicitou a recuperação de sua senha na ${BRAND_NAME}.</p>
          
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Redefinir Senha
            </a>
          </div>
          
          <p><strong>Importante:</strong></p>
          <ul>
            <li>Este link é válido por 1 hora</li>
            <li>Se você não solicitou esta recuperação, ignore este email</li>
            <li>Por segurança, este link só pode ser usado uma vez</li>
          </ul>
          
          <p>Se o botão não funcionar, copie e cole este link no seu navegador:</p>
          <p style="word-break: break-all; color: #6b7280; font-size: 12px;">${resetUrl}</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2024 ${BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    `;

    const emailText = `
      Recuperação de Senha - ${BRAND_NAME}
      
      Olá, ${user.name}!
      
      Você solicitou a recuperação de sua senha na ${BRAND_NAME}.
      
      Para redefinir sua senha, acesse: ${resetUrl}
      
      Importante:
      - Este link é válido por 1 hora
      - Se você não solicitou esta recuperação, ignore este email
      - Por segurança, este link só pode ser usado uma vez
      
      © 2024 ${BRAND_NAME}. Todos os direitos reservados.
    `;

    try {
      await sendEmail({
        to: sanitizedData.email,
        subject: `Recuperação de Senha - ${BRAND_NAME}`,
        html: emailHtml,
        text: emailText
      });
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      return errorResponse('Erro ao enviar email de recuperação');
    }

    // Tentar enviar push opcional com aviso e deep link (sem exibir OTP/token)
    try {
      if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
        const subs = await prisma.pushSubscription.findMany({ where: { userId: user.id } })
        if (subs.length > 0) {
          const payload = JSON.stringify({
            title: 'Recuperação de senha',
            body: `Solicitação de recuperação recebida. Toque para continuar.`,
            data: { url: `/redefinir-senha?token=${resetToken}` }
          })
          await Promise.allSettled(subs.map(s => webpush.sendNotification({ endpoint: s.endpoint, keys: s.keys as any } as any, payload)))
        }
      }
    } catch (err) {
      // silencioso
    }

    return NextResponse.json(
      successResponse({}, 'Se o email existir, você receberá instruções de recuperação.')
    );
  } catch (error: any) {
    console.error('Erro ao processar recuperação de senha:', error);
    return errorResponse('Erro interno do servidor', 500);
  }
}

