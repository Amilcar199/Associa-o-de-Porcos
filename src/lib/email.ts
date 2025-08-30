import nodemailer from 'nodemailer';
import { BRAND_NAME } from '@/lib/brand'

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Configurar transporter do Nodemailer
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || '587', 10),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_SERVER_USER || process.env.SMTP_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASS,
    },
  });
};

// Função para enviar email
export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"${BRAND_NAME}" <${process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    await transporter.sendMail(mailOptions);
    console.log('Email enviado com sucesso para:', options.to);
    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

// Template para email de boas-vindas
export const getWelcomeEmailTemplate = (userName: string): EmailTemplate => {
  return {
    subject: `Bem-vindo à ${BRAND_NAME}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">${BRAND_NAME}</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Olá, ${userName}!</h2>
          <p>Seja bem-vindo à ${BRAND_NAME}! Estamos muito felizes em tê-lo como membro da nossa comunidade.</p>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">O que você pode fazer agora:</h3>
            <ul>
              <li>Acessar conteúdo exclusivo na área de membros</li>
              <li>Participar de eventos e workshops</li>
              <li>Conectar-se com outros profissionais</li>
              <li>Receber atualizações sobre o setor</li>
            </ul>
          </div>
          
          <p>Se você tiver alguma dúvida, não hesite em entrar em contato conosco.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/membros" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Acessar Área de Membros
            </a>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2024 ${BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
    text: `
      Olá, ${userName}!
      
      Seja bem-vindo à ${BRAND_NAME}! Estamos muito felizes em tê-lo como membro da nossa comunidade.
      
      O que você pode fazer agora:
      - Acessar conteúdo exclusivo na área de membros
      - Participar de eventos e workshops
      - Conectar-se com outros profissionais
      - Receber atualizações sobre o setor
      
      Se você tiver alguma dúvida, não hesite em entrar em contato conosco.
      
      Acesse: ${process.env.NEXTAUTH_URL}/membros
      
      © 2024 ${BRAND_NAME}. Todos os direitos reservados.
    `
  };
};

export const getVerificationCodeTemplate = (userName: string, code: string): EmailTemplate => {
  return {
    subject: `Código de Verificação`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Verificação de Email</h1>
        </div>
        <div style="padding: 20px;">
          <p>Olá, ${userName}.</p>
          <p>Seu código de verificação é:</p>
          <div style="font-size: 28px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 16px 0;">${code}</div>
          <p>Este código expira em 15 minutos.</p>
        </div>
      </div>
    `,
    text: `Seu código de verificação é ${code} (expira em 15 minutos).`
  }
}

// Template para email de notificação de contato
export const getContactNotificationTemplate = (contactData: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): EmailTemplate => {
  return {
    subject: `Nova mensagem de contato: ${contactData.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Nova Mensagem de Contato</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>Detalhes da Mensagem:</h2>
          
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
            <p><strong>Nome:</strong> ${contactData.name}</p>
            <p><strong>Email:</strong> ${contactData.email}</p>
            <p><strong>Assunto:</strong> ${contactData.subject}</p>
            <p><strong>Mensagem:</strong></p>
            <div style="background-color: white; padding: 10px; border-radius: 4px; margin-top: 10px;">
              ${contactData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}/admin/contatos" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver no Painel Admin
            </a>
          </div>
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2024 ${BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
    text: `
      Nova Mensagem de Contato
      
      Detalhes da Mensagem:
      Nome: ${contactData.name}
      Email: ${contactData.email}
      Assunto: ${contactData.subject}
      Mensagem: ${contactData.message}
      
      Ver no Painel Admin: ${process.env.NEXTAUTH_URL}/admin/contatos
      
      © 2024 ${BRAND_NAME}. Todos os direitos reservados.
    `
  };
};

// Template para email de newsletter
export const getNewsletterTemplate = (title: string, content: string, unsubscribeUrl?: string): EmailTemplate => {
  return {
    subject: `Newsletter: ${title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Newsletter - ${BRAND_NAME}</h1>
        </div>
        
        <div style="padding: 20px;">
          <h2>${title}</h2>
          
          <div style="line-height: 1.6;">
            ${content}
          </div>
          
          ${unsubscribeUrl ? `
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: none; font-size: 12px;">
                Cancelar inscrição
              </a>
            </div>
          ` : ''}
        </div>
        
        <div style="background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
          <p>© 2024 ${BRAND_NAME}. Todos os direitos reservados.</p>
        </div>
      </div>
    `,
    text: `
      Newsletter - ${BRAND_NAME}
      
      ${title}
      
      ${content}
      
      ${unsubscribeUrl ? `Cancelar inscrição: ${unsubscribeUrl}` : ''}
      
      © 2024 ${BRAND_NAME}. Todos os direitos reservados.
    `
  };
};

// Função para enviar email de boas-vindas
export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  const template = getWelcomeEmailTemplate(userName);
  return sendEmail({
    to: userEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

// Função para enviar notificação de contato
export const sendContactNotification = async (
  adminEmail: string, 
  contactData: { name: string; email: string; subject: string; message: string }
): Promise<boolean> => {
  const template = getContactNotificationTemplate(contactData);
  return sendEmail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    text: template.text
  });
};

// Função para enviar newsletter
export const sendNewsletter = async (
  subscriberEmails: string[], 
  title: string, 
  content: string, 
  unsubscribeUrl?: string
): Promise<boolean> => {
  const template = getNewsletterTemplate(title, content, unsubscribeUrl);
  
  const emailPromises = subscriberEmails.map(email => 
    sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    })
  );
  
  const results = await Promise.all(emailPromises);
  return results.every(result => result);
};
