import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';

// Types for footer configuration
interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  ariaLabel: string;
}

interface ContactInfo {
  type: 'email' | 'phone' | 'address';
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
}

// Footer configuration data
const footerSections: FooterSection[] = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Our Team', href: '/team' },
      { label: 'Careers', href: '/careers' },
      { label: 'News', href: '/news' },
    ],
  },
  {
    title: 'Services',
    links: [
      { label: 'Web Development', href: '/services/web-development' },
      { label: 'Mobile Apps', href: '/services/mobile-apps' },
      { label: 'Consulting', href: '/services/consulting' },
      { label: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '/docs' },
      { label: 'Blog', href: '/blog' },
      { label: 'Help Center', href: '/help' },
      { label: 'API Reference', href: '/api-docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookies' },
      { label: 'GDPR', href: '/gdpr' },
    ],
  },
];

const socialLinks: SocialLink[] = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/yourcompany',
    icon: FaFacebook,
    ariaLabel: 'Follow us on Facebook',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/yourcompany',
    icon: FaTwitter,
    ariaLabel: 'Follow us on Twitter',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/yourcompany',
    icon: FaInstagram,
    ariaLabel: 'Follow us on Instagram',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/yourcompany',
    icon: FaLinkedin,
    ariaLabel: 'Connect with us on LinkedIn',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/yourcompany',
    icon: FaGithub,
    ariaLabel: 'View our GitHub repositories',
  },
];

const contactInfo: ContactInfo[] = [
  {
    type: 'email',
    value: 'contact@yourcompany.com',
    icon: MdEmail,
    href: 'mailto:contact@yourcompany.com',
  },
  {
    type: 'phone',
    value: '+1 (555) 123-4567',
    icon: MdPhone,
    href: 'tel:+15551234567',
  },
  {
    type: 'address',
    value: '123 Business St, City, State 12345',
    icon: MdLocationOn,
  },
];

/**
 * Footer Link Component
 * Renders individual footer links with proper Next.js Link handling
 */
const FooterLink: React.FC<{ link: FooterLink }> = ({ link }) => {
  const linkClasses = 'text-gray-400 hover:text-white transition-colors duration-200';
  
  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={linkClasses}>
      {link.label}
    </Link>
  );
};

/**
 * Footer Section Component
 * Renders a section of footer links with title
 */
const FooterSection: React.FC<{ section: FooterSection }> = ({ section }) => (
  <div className="space-y-4">
    <h3 className="text-lg font-semibold text-white">{section.title}</h3>
    <ul className="space-y-2">
      {section.links.map((link, index) => (
        <li key={`${section.title}-${index}`}>
          <FooterLink link={link} />
        </li>
      ))}
    </ul>
  </div>
);

/**
 * Social Links Component
 * Renders social media icons with links
 */
const SocialLinks: React.FC = () => (
  <div className="flex space-x-4">
    {socialLinks.map((social) => {
      const IconComponent = social.icon;
      return (
        <a
          key={social.name}
          href={social.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={social.ariaLabel}
          className="text-gray-400 hover:text-white transition-colors duration-200 text-xl"
        >
          <IconComponent className="w-6 h-6" />
        </a>
      );
    })}
  </div>
);

/**
 * Contact Information Component
 * Renders contact details with icons
 */
const ContactInfo: React.FC = () => (
  <div className="space-y-3">
    <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
    {contactInfo.map((contact, index) => {
      const IconComponent = contact.icon;
      const content = (
        <div className="flex items-center space-x-3 text-gray-400">
          <IconComponent className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{contact.value}</span>
        </div>
      );

      if (contact.href) {
        return (
          <a
            key={index}
            href={contact.href}
            className="block hover:text-white transition-colors duration-200"
          >
            {content}
          </a>
        );
      }

      return (
        <div key={index} className="block">
          {content}
        </div>
      );
    })}
  </div>
);

/**
 * Newsletter Signup Component
 * Simple newsletter subscription form
 */
const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [message, setMessage] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      // Replace with your actual newsletter signup API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">Stay Updated</h3>
      <p className="text-gray-400 text-sm">
        Subscribe to our newsletter for the latest updates and news.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </div>
        {message && (
          <p className={`text-sm ${
            message.includes('Thank you') ? 'text-green-400' : 'text-red-400'
          }`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

/**
 * Main Footer Component
 * Complete footer with all sections, links, and company information
 */
const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Company Info & Newsletter */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Logo/Name */}
            <div>
              <Link href="/" className="text-2xl font-bold text-white hover:text-gray-300 transition-colors duration-200">
                Your Company
              </Link>
              <p className="mt-2 text-gray-400 text-sm max-w-md">
                Building innovative solutions for the modern web. We help businesses 
                grow through cutting-edge technology and exceptional user experiences.
              </p>
            </div>
            
            {/* Newsletter Signup */}
            <NewsletterSignup />
          </div>

          {/* Footer Links Sections */}
          {footerSections.map((section, index) => (
            <div key={section.title} className="lg:col-span-1">
              <FooterSection section={section} />
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ContactInfo />
            
            {/* Social Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Follow Us</h3>
              <SocialLinks />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} Your Company. All rights reserved.
            </div>
            
            {/* Additional Bottom Links */}
            <div className="flex space-x-6 text-sm">
              <Link href="/sitemap" className="text-gray-400 hover:text-white transition-colors duration-200">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-gray-400 hover:text-white transition-colors duration-200">
                Accessibility
              </Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;