import { NextRequest, NextResponse } from 'next/server';
import { crmApi } from '@/lib/crm-api';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Create lead in EspoCRM
    const lead = await crmApi.createLead({
      firstName: data.firstName,
      lastName: data.lastName,
      emailAddress: data.email,
      description: `Service Request: ${data.serviceName}\nAddress: ${data.address}\nPhone: ${data.phone}\nNotes: ${data.notes || 'N/A'}`
    });

    // Create appointment/meeting
    const dateTime = new Date(`${data.preferredDate}T${data.preferredTime}`);
    const endTime = new Date(dateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    const appointment = await crmApi.createMeeting({
      name: `${data.serviceName} - ${data.firstName} ${data.lastName}`,
      dateStart: dateTime.toISOString(),
      dateEnd: endTime.toISOString(),
      leadId: lead.id,
      description: `Service: ${data.serviceName}\nCustomer: ${data.firstName} ${data.lastName}\nPhone: ${data.phone}\nEmail: ${data.email}\nAddress: ${data.address}\nNotes: ${data.notes || 'None'}`,
      status: 'Planned'
    });

    // Create task for service team
    const task = await crmApi.createTask({
      name: `Schedule ${data.serviceName} technician`,
      status: 'Not Started',
      priority: 'High',
      dateEnd: dateTime.toISOString(),
      description: `Assign technician for ${data.serviceName} service\nAppointment ID: ${appointment.id}`,
      parentType: 'Meeting',
      parentId: appointment.id
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      appointmentId: appointment.id,
      taskId: task.id
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}