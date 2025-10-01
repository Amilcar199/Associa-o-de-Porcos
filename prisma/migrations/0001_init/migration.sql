-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `role` ENUM('admin', 'member', 'visitor') NOT NULL DEFAULT 'visitor',
    `avatar` VARCHAR(500) NULL,
    `phone` VARCHAR(32) NULL,
    `company` VARCHAR(100) NULL,
    `bio` VARCHAR(500) NULL,
    `location` VARCHAR(100) NULL,
    `website` VARCHAR(500) NULL,
    `socialMedia` JSON NULL,
    `preferences` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLogin` DATETIME(3) NULL,
    `passwordResetToken` VARCHAR(191) NULL,
    `passwordResetExpires` DATETIME(3) NULL,
    `loginAttempts` INTEGER NOT NULL DEFAULT 0,
    `lockUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `News` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `slug` VARCHAR(200) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` VARCHAR(300) NOT NULL,
    `featuredImage` VARCHAR(191) NOT NULL,
    `images` JSON NULL,
    `videos` JSON NULL,
    `category` VARCHAR(20) NOT NULL,
    `tags` JSON NULL,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `News_slug_key`(`slug`),
    INDEX `News_category_published_idx`(`category`, `published`),
    INDEX `News_authorId_published_idx`(`authorId`, `published`),
    INDEX `News_published_featured_publishedAt_idx`(`published`, `featured`, `publishedAt`),
    INDEX `News_publishedAt_idx`(`publishedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `breed` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `weight` INTEGER NOT NULL,
    `price` DOUBLE NULL,
    `pricePerKg` DOUBLE NULL,
    `saleForm` ENUM('carcaça', 'vivo') NULL,
    `images` JSON NOT NULL,
    `videos` JSON NULL,
    `features` JSON NULL,
    `healthStatus` VARCHAR(191) NOT NULL,
    `vaccinated` BOOLEAN NOT NULL DEFAULT false,
    `location` VARCHAR(100) NOT NULL,
    `code` VARCHAR(32) NOT NULL,
    `availability` VARCHAR(191) NOT NULL DEFAULT 'available',
    `tags` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `sellerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Product_code_key`(`code`),
    INDEX `Product_breed_availability_isActive_idx`(`breed`, `availability`, `isActive`),
    INDEX `Product_price_availability_isActive_idx`(`price`, `availability`, `isActive`),
    INDEX `Product_pricePerKg_availability_isActive_idx`(`pricePerKg`, `availability`, `isActive`),
    INDEX `Product_saleForm_availability_isActive_idx`(`saleForm`, `availability`, `isActive`),
    INDEX `Product_age_weight_idx`(`age`, `weight`),
    INDEX `Product_sellerId_isActive_idx`(`sellerId`, `isActive`),
    INDEX `Product_location_availability_idx`(`location`, `availability`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MemberContent` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `url` VARCHAR(500) NULL,
    `thumbnail` VARCHAR(500) NULL,
    `content` LONGTEXT NULL,
    `fileUrl` VARCHAR(500) NULL,
    `videoUrl` VARCHAR(500) NULL,
    `eventDate` DATETIME(3) NULL,
    `eventLocation` VARCHAR(200) NULL,
    `isFeatured` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `tags` JSON NULL,
    `views` INTEGER NOT NULL DEFAULT 0,
    `downloads` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `authorId` VARCHAR(191) NOT NULL,

    INDEX `MemberContent_type_category_idx`(`type`, `category`),
    INDEX `MemberContent_isActive_isFeatured_idx`(`isActive`, `isFeatured`),
    INDEX `MemberContent_authorId_idx`(`authorId`),
    INDEX `MemberContent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Collaborator` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(100) NOT NULL,
    `company` VARCHAR(100) NULL,
    `description` VARCHAR(500) NULL,
    `avatar` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(32) NULL,
    `website` VARCHAR(500) NULL,
    `socialMedia` JSON NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Collaborator_isActive_featured_order_idx`(`isActive`, `featured`, `order`),
    INDEX `Collaborator_featured_order_idx`(`featured`, `order`),
    INDEX `Collaborator_order_idx`(`order`),
    INDEX `Collaborator_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(32) NULL,
    `subject` VARCHAR(200) NOT NULL,
    `message` VARCHAR(2000) NOT NULL,
    `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Contact_email_idx`(`email`),
    INDEX `Contact_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `Contact_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LegalSection` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL DEFAULT '',
    `description` VARCHAR(191) NOT NULL DEFAULT '',
    `items` JSON NULL,
    `updatedBy` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LegalSection_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketQuote` (
    `id` VARCHAR(191) NOT NULL,
    `weekISO` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `saleForm` ENUM('carcaça', 'vivo') NOT NULL,
    `status` ENUM('draft', 'approved', 'archived') NOT NULL DEFAULT 'draft',
    `refPricePerKg` DOUBLE NOT NULL,
    `refPricePerHead` DOUBLE NULL,
    `minSamples` INTEGER NOT NULL DEFAULT 0,
    `methodologyNote` VARCHAR(1000) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `approvedById` VARCHAR(191) NULL,

    INDEX `MarketQuote_region_saleForm_idx`(`region`, `saleForm`),
    UNIQUE INDEX `MarketQuote_weekISO_region_saleForm_status_key`(`weekISO`, `region`, `saleForm`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(64) NULL,
    `userAgent` VARCHAR(191) NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PushSubscription` (
    `id` VARCHAR(191) NOT NULL,
    `endpoint` VARCHAR(191) NOT NULL,
    `expirationTime` INTEGER NULL,
    `keys` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NULL,

    UNIQUE INDEX `PushSubscription_endpoint_key`(`endpoint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteConfig` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `logoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `publicLogoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `adminLogoUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `currency` VARCHAR(191) NOT NULL DEFAULT 'AOA',
    `locale` VARCHAR(191) NOT NULL DEFAULT 'pt-AO',
    `contactEmail` VARCHAR(191) NOT NULL DEFAULT '',
    `contactPhone` VARCHAR(191) NOT NULL DEFAULT '',
    `whatsappNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `facebookUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `instagramUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `linkedinUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `youtubeUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `twitterUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `tiktokUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `News` ADD CONSTRAINT `News_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemberContent` ADD CONSTRAINT `MemberContent_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketQuote` ADD CONSTRAINT `MarketQuote_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketQuote` ADD CONSTRAINT `MarketQuote_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PushSubscription` ADD CONSTRAINT `PushSubscription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

