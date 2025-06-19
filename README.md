# Home Service Pro - Customer Frontend

A Next.js application for customers to book home services, integrated with EspoCRM for backend management.

## Features

- 🏠 Service catalog with 8 different home services
- 📝 Easy booking form with validation
- 🤖 AI-powered chatbot for customer support
- 🔗 Direct integration with EspoCRM
- 📱 Responsive design for all devices

## CRM Integration

This frontend connects to **EspoCRM** which provides:
- Lead management
- Appointment scheduling
- Task assignment for technicians
- Customer relationship tracking
- RESTful API for all operations

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.local.example` to `.env.local` and update:
   ```
   NEXT_PUBLIC_CRM_API_URL=http://localhost/espocrm/api/v1
   CRM_API_USERNAME=your_username
   CRM_API_PASSWORD=your_password
   OPENAI_API_KEY=your_openai_key (optional)
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

## How It Works

1. **Customer selects a service** from the catalog
2. **Fills out booking form** with contact details and preferred time
3. **System creates in EspoCRM:**
   - Lead record with customer information
   - Meeting/appointment for the service
   - Task for assigning a technician
4. **AI Chatbot** helps with questions and booking assistance

## API Routes

- `/api/booking` - Creates lead, appointment, and task in CRM
- `/api/chat` - Handles chatbot conversations

## Technologies

- Next.js 14 with App Router
- TypeScript
- Tailwind CSS
- React Hook Form + Zod validation
- Axios for API calls
- Lucide React for icons

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Deploy to Vercel, Netlify, or your preferred platform

## Future Enhancements

- Real-time appointment availability checking
- Customer portal for viewing booking history
- SMS/email notifications
- Payment integration
- Advanced AI chatbot with OpenAI GPT-4