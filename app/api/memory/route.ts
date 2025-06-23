import { NextRequest, NextResponse } from 'next/server';
import { handleMemoryRequest } from '@/lib/hybrid-memory-system';

export async function POST(request: NextRequest) {
  try {
    const { action, params } = await request.json();
    
    const result = await handleMemoryRequest(action, params);
    
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Example: Claude can call this API to extend its memory
// POST /api/memory
// {
//   "action": "store",
//   "params": {
//     "id": "project_context_001",
//     "data": { /* massive codebase analysis */ },
//     "metadata": { "type": "codebase" }
//   }
// }