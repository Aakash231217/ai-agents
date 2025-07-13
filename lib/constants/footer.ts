/**
 * Footer configuration constants
 * Contains all footer-related data including navigation links, social media, and company information
 */

// Types for footer configuration
export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  ariaLabel?: string;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface SocialMediaLink {
  platform: string;
  href: string;
  icon: string; // Icon name or component identifier
  ariaLabel: string;
}

export interface CompanyInfo {
  name: string;
  description: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    email: string;
    phone?: string;
  };
}

export interface FooterConfig {
  companyInfo: CompanyInfo;
  sections: FooterSection[];
  socialMedia: SocialMediaLink[];
  legalLinks: FooterLink[];
  newsletter?: {
    title: string;
    description: string;
    placeholder: string;
  };
  copyright: {
    year: number;
    text: string;
  };
}

// Company information
export const COMPANY_INFO: CompanyInfo = {
  name: "Your Company",
  description: "Building amazing digital experiences with modern web technologies.",
  address: {
    street: "123 Tech Street",
    city: "San Francisco",
    state: "CA",
    zipCode: "94105",
    country: "USA"
  },
  contact: {
    email: "hello@yourcompany.com",
    phone: "+1 (555) 123-4567"
  }
};

// Footer navigation sections
export const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "Product",
    links: [
      {
        label: "Features",
        href: "/features",
        ariaLabel: "View product features"
      },
      {
        label: "Pricing",
        href: "/pricing",
        ariaLabel: "View pricing plans"
      },
      {
        label: "Documentation",
        href: "/docs",
        ariaLabel: "View documentation"
      },
      {
        label: "API Reference",
        href: "/api",
        ariaLabel: "View API reference"
      }
    ]
  },
  {
    title: "Company",
    links: [
      {
        label: "About Us",
        href: "/about",
        ariaLabel: "Learn about our company"
      },
      {
        label: "Careers",
        href: "/careers",
        ariaLabel: "View career opportunities"
      },
      {
        label: "Blog",
        href: "/blog",
        ariaLabel: "Read our blog"
      },
      {
        label: "Press",
        href: "/press",
        ariaLabel: "View press releases"
      }
    ]
  },
  {
    title: "Support",
    links: [
      {
        label: "Help Center",
        href: "/help",
        ariaLabel: "Visit help center"
      },
      {
        label: "Contact Us",
        href: "/contact",
        ariaLabel: "Contact support"
      },
      {
        label: "Status",
        href: "https://status.yourcompany.com",
        external: true,
        ariaLabel: "Check system status"
      },
      {
        label: "Community",
        href: "/community",
        ariaLabel: "Join our community"
      }
    ]
  },
  {
    title: "Resources",
    links: [
      {
        label: "Tutorials",
        href: "/tutorials",
        ariaLabel: "View tutorials"
      },
      {
        label: "Case Studies",
        href: "/case-studies",
        ariaLabel: "Read case studies"
      },
      {
        label: "Webinars",
        href: "/webinars",
        ariaLabel: "Join webinars"
      },
      {
        label: "Downloads",
        href: "/downloads",
        ariaLabel: "Access downloads"
      }
    ]
  }
];

// Social media links
export const SOCIAL_MEDIA_LINKS: SocialMediaLink[] = [
  {
    platform: "Twitter",
    href: "https://twitter.com/yourcompany",
    icon: "twitter",
    ariaLabel: "Follow us on Twitter"
  },
  {
    platform: "LinkedIn",
    href: "https://linkedin.com/company/yourcompany",
    icon: "linkedin",
    ariaLabel: "Connect with us on LinkedIn"
  },
  {
    platform: "GitHub",
    href: "https://github.com/yourcompany",
    icon: "github",
    ariaLabel: "View our GitHub repositories"
  },
  {
    platform: "YouTube",
    href: "https://youtube.com/c/yourcompany",
    icon: "youtube",
    ariaLabel: "Subscribe to our YouTube channel"
  },
  {
    platform: "Discord",
    href: "https://discord.gg/yourcompany",
    icon: "discord",
    ariaLabel: "Join our Discord community"
  }
];

// Legal and policy links
export const LEGAL_LINKS: FooterLink[] = [
  {
    label: "Privacy Policy",
    href: "/privacy",
    ariaLabel: "Read our privacy policy"
  },
  {
    label: "Terms of Service",
    href: "/terms",
    ariaLabel: "Read our terms of service"
  },
  {
    label: "Cookie Policy",
    href: "/cookies",
    ariaLabel: "Read our cookie policy"
  },
  {
    label: "GDPR",
    href: "/gdpr",
    ariaLabel: "View GDPR compliance information"
  }
];

// Newsletter configuration
export const NEWSLETTER_CONFIG = {
  title: "Stay Updated",
  description: "Get the latest news, updates, and tips delivered to your inbox.",
  placeholder: "Enter your email address"
};

// Copyright information
export const COPYRIGHT_INFO = {
  year: new Date().getFullYear(),
  text: `© ${new Date().getFullYear()} ${COMPANY_INFO.name}. All rights reserved.`
};

// Complete footer configuration
export const FOOTER_CONFIG: FooterConfig = {
  companyInfo: COMPANY_INFO,
  sections: FOOTER_SECTIONS,
  socialMedia: SOCIAL_MEDIA_LINKS,
  legalLinks: LEGAL_LINKS,
  newsletter: NEWSLETTER_CONFIG,
  copyright: COPYRIGHT_INFO
};

// Utility functions for footer data
export const getFooterLinksBySection = (sectionTitle: string): FooterLink[] => {
  try {
    const section = FOOTER_SECTIONS.find(s => s.title === sectionTitle);
    return section?.links || [];
  } catch (error) {
    console.error(`Error getting footer links for section "${sectionTitle}":`, error);
    return [];
  }
};

export const getSocialMediaLink = (platform: string): SocialMediaLink | null => {
  try {
    return SOCIAL_MEDIA_LINKS.find(link => 
      link.platform.toLowerCase() === platform.toLowerCase()
    ) || null;
  } catch (error) {
    console.error(`Error getting social media link for platform "${platform}":`, error);
    return null;
  }
};

export const isExternalLink = (href: string): boolean => {
  try {
    return href.startsWith('http://') || href.startsWith('https://') || href.startsWith('//');
  } catch (error) {
    console.error(`Error checking if link is external: "${href}":`, error);
    return false;
  }
};

// Export default configuration
export default FOOTER_CONFIG;