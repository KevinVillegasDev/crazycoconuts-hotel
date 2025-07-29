const nodemailer = require('nodemailer');

// Configure email transporter
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send booking confirmation email
 * @param {Object} booking - Booking object
 */
async function sendBookingConfirmation(booking) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email service not configured. Booking confirmation not sent.');
        return;
    }
    
    try {
        const roomNames = {
            'ocean-view': 'Ocean View Room',
            'beachfront-suite': 'Beachfront Suite',
            'presidential-villa': 'Presidential Villa'
        };
        
        const emailHtml = generateBookingConfirmationHTML(booking, roomNames);
        
        const mailOptions = {
            from: `"Crazy Coconuts Hotel" <${process.env.SMTP_USER}>`,
            to: booking.email,
            subject: `Booking Confirmation - ${booking.confirmationNumber}`,
            html: emailHtml,
            text: generateBookingConfirmationText(booking, roomNames)
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Booking confirmation email sent:', info.messageId);
        
    } catch (error) {
        console.error('Error sending booking confirmation email:', error);
        throw error;
    }
}

/**
 * Generate HTML email template for booking confirmation
 * @param {Object} booking - Booking object
 * @param {Object} roomNames - Room type to name mapping
 * @returns {string} HTML email content
 */
function generateBookingConfirmationHTML(booking, roomNames) {
    const checkInDate = booking.checkInDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const checkOutDate = booking.checkOutDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2E8B57; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #2E8B57; }
            .total { font-size: 1.2em; font-weight: bold; color: #2E8B57; background: #e8f5e8; padding: 15px; border-radius: 5px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            .logo { font-size: 2em; font-weight: bold; margin-bottom: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🥥 Crazy Coconuts Hotel</div>
                <h1>Booking Confirmed!</h1>
                <p>Thank you for choosing our tropical paradise</p>
            </div>
            
            <div class="content">
                <h2>Dear ${booking.firstName} ${booking.lastName},</h2>
                <p>We're delighted to confirm your reservation at Crazy Coconuts Hotel. Get ready for an unforgettable stay on Colombia's beautiful coast!</p>
                
                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <span class="detail-label">Confirmation Number:</span>
                        <span><strong>${booking.confirmationNumber}</strong></span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Room Type:</span>
                        <span>${roomNames[booking.roomType]}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-in:</span>
                        <span>${checkInDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Check-out:</span>
                        <span>${checkOutDate}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Nights:</span>
                        <span>${booking.numberOfNights}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Guests:</span>
                        <span>${booking.guestCount}</span>
                    </div>
                    ${booking.specialRequests ? `
                    <div class="detail-row">
                        <span class="detail-label">Special Requests:</span>
                        <span>${booking.specialRequests}</span>
                    </div>
                    ` : ''}
                </div>
                
                <div class="booking-details">
                    <h3>Pricing Summary</h3>
                    <div class="detail-row">
                        <span class="detail-label">Room Rate (${booking.numberOfNights} nights):</span>
                        <span>$${booking.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Taxes & Fees:</span>
                        <span>$${booking.taxes.toFixed(2)}</span>
                    </div>
                    <div class="total">
                        <div class="detail-row" style="border: none; margin: 0; font-size: 1.1em;">
                            <span>Total Amount:</span>
                            <span>$${booking.totalAmount.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #2E8B57; margin-top: 0;">What to Expect</h3>
                    <ul>
                        <li>Check-in time: 3:00 PM</li>
                        <li>Check-out time: 11:00 AM</li>
                        <li>Free WiFi throughout the resort</li>
                        <li>Complimentary breakfast</li>
                        <li>Beach access and pool facilities</li>
                    </ul>
                </div>
                
                <p><strong>Need to make changes?</strong> Contact us at <a href="mailto:reservations@crazycoconuts.com">reservations@crazycoconuts.com</a> or call +57 5 432 1000.</p>
                
                <p>We can't wait to welcome you to paradise!</p>
                
                <p>Warm regards,<br>
                The Crazy Coconuts Hotel Team</p>
            </div>
            
            <div class="footer">
                <p>Crazy Coconuts Hotel<br>
                Carrera 2 #5-41, Santa Marta, Magdalena, Colombia<br>
                Phone: +57 5 432 1000 | Email: info@crazycoconuts.com</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

/**
 * Generate plain text email for booking confirmation
 * @param {Object} booking - Booking object
 * @param {Object} roomNames - Room type to name mapping
 * @returns {string} Plain text email content
 */
function generateBookingConfirmationText(booking, roomNames) {
    const checkInDate = booking.checkInDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    const checkOutDate = booking.checkOutDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    return `
CRAZY COCONUTS HOTEL - BOOKING CONFIRMATION

Dear ${booking.firstName} ${booking.lastName},

We're delighted to confirm your reservation at Crazy Coconuts Hotel!

BOOKING DETAILS:
Confirmation Number: ${booking.confirmationNumber}
Room Type: ${roomNames[booking.roomType]}
Check-in: ${checkInDate}
Check-out: ${checkOutDate}
Nights: ${booking.numberOfNights}
Guests: ${booking.guestCount}
${booking.specialRequests ? `Special Requests: ${booking.specialRequests}` : ''}

PRICING SUMMARY:
Room Rate (${booking.numberOfNights} nights): $${booking.subtotal.toFixed(2)}
Taxes & Fees: $${booking.taxes.toFixed(2)}
Total Amount: $${booking.totalAmount.toFixed(2)}

HOTEL INFORMATION:
Check-in time: 3:00 PM
Check-out time: 11:00 AM
Address: Carrera 2 #5-41, Santa Marta, Magdalena, Colombia
Phone: +57 5 432 1000
Email: reservations@crazycoconuts.com

We can't wait to welcome you to paradise!

Warm regards,
The Crazy Coconuts Hotel Team
    `;
}

/**
 * Send general email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} html - HTML content
 * @param {string} text - Plain text content
 */
async function sendEmail(to, subject, html, text) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email service not configured. Email not sent.');
        return;
    }
    
    try {
        const mailOptions = {
            from: `"Crazy Coconuts Hotel" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
        
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = {
    sendBookingConfirmation,
    sendEmail
};