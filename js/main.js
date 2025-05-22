/**
 * Portfolio Website JavaScript
 * This file contains all interactive functionality for the portfolio website
 */

// Wait for DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all functions
    setupMobileMenu();
    setupSmoothScrolling();
    setupScrollEvents();
    setupFormValidation();
    setupProjectHoverEffects();
});

/**
 * Mobile Menu Toggle Functionality
 * Controls the mobile navigation menu toggle
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav ul');
    
    if (!menuToggle || !nav) return;
    
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('active');
        menuToggle.classList.toggle('active');
        
        // Toggle aria-expanded for accessibility
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
        menuToggle.setAttribute('aria-expanded', !isExpanded);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuToggle.contains(e.target)) {
            nav.classList.remove('active');
            menuToggle.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

/**
 * Smooth Scrolling Navigation
 * Enhances the CSS smooth scrolling with JavaScript
 */
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a, .hero-content a, .footer-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Check if the link is an anchor link
            if (this.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                
                if (targetElement) {
                    // Close mobile menu if open
                    const nav = document.querySelector('nav ul');
                    const menuToggle = document.querySelector('.menu-toggle');
                    
                    if (nav && nav.classList.contains('active')) {
                        nav.classList.remove('active');
                        menuToggle.classList.remove('active');
                    }
                    
                    // Calculate header height for offset
                    const headerHeight = document.querySelector('header').offsetHeight;
                    const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update URL without page jump
                    history.pushState(null, null, targetId);
                }
            }
        });
    });
}

/**
 * Scroll Events
 * Handles various scroll-based animations and effects
 */
function setupScrollEvents() {
    const header = document.querySelector('header');
    const skillLevels = document.querySelectorAll('.skill-level');
    
    // Set initial attributes for skill bars
    skillLevels.forEach(skillLevel => {
        const width = skillLevel.style.width;
        skillLevel.style.width = '0';
        skillLevel.dataset.width = width;
    });
    
    // Function to check if element is in viewport
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) * 0.8 &&
            rect.bottom >= 0
        );
    }
    
    // Scroll event handler
    function handleScroll() {
        // Header background change on scroll
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Animate skill bars when in viewport
        const skillsSection = document.querySelector('#skills');
        if (skillsSection && isInViewport(skillsSection)) {
            skillLevels.forEach(skillLevel => {
                if (skillLevel.style.width === '0px' || skillLevel.style.width === '0%') {
                    skillLevel.style.width = skillLevel.dataset.width;
                }
            });
        }
        
        // Highlight active nav section
        const sections = document.querySelectorAll('section');
        const navLinks = document.querySelectorAll('nav ul li a');
        
        sections.forEach(section => {
            if (isInViewport(section)) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial call to set initial states
    handleScroll();
}

/**
 * Form Validation and Submission
 * Handles contact form validation and submission
 */
function setupFormValidation() {
    const contactForm = document.getElementById('contact-form');
    
    if (!contactForm) return;
    
        e.preventDefault();
        
        // Get form fields
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');
        
        // Reset previous error states
        const formGroups = contactForm.querySelectorAll('.form-group');
        formGroups.forEach(group => group.classList.remove('error'));
        
        // Validate form fields
        let isValid = true;
        
        // Name validation
        if (!nameInput.value.trim()) {
            showError(nameInput, 'Please enter your name');
            isValid = false;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim() || !emailRegex.test(emailInput.value)) {
            showError(emailInput, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Subject validation
        if (!subjectInput.value.trim()) {
            showError(subjectInput, 'Please enter a subject');
            isValid = false;
        }
        
        // Message validation
        if (!messageInput.value.trim()) {
            showError(messageInput, 'Please enter your message');
            isValid = false;
        }
        
        // If form is valid, process submission
        if (isValid) {
            // In a real application, you would send the form data to a server here
            // For this example, we'll just show a success message
            
            // Create a success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.innerHTML = `
                <i class="fas fa-check-circle"></i>
                <p>Thank you for your message! I'll get back to you soon.</p>
            `;
            
            // Replace form with success message
            contactForm.innerHTML = '';
            contactForm.appendChild(successMessage);
        }
    });
    
    // Function to show error for a field
    function showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        
        // Check if error message already exists
        let errorElement = formGroup.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
    }
    
    // Real-time validation as user types
    const inputs = contactForm.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            const formGroup = this.closest('.form-group');
            formGroup.classList.remove('error');
            const errorElement = formGroup.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        });
    });
}

/**
 * Project Hover Effects
 * Enhances project card hover interactions
 */
function setupProjectHoverEffects() {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.classList.add('hovered');
        });
        
        card.addEventListener('mouseleave', function() {
            this.classList.remove('hovered');
        });
        
        // Add focus events for accessibility
        const links = card.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('focus', () => {
                card.classList.add('hovered');
            });
            
            link.addEventListener('blur', () => {
                card.classList.remove('hovered');
            });
        });
    });
}

/**
 * Helper Functions
 */

// Debounce function to limit how often a function can be called
function debounce(func, wait = 20, immediate = true) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        const later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

