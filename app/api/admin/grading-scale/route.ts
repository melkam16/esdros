import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'grading-scales.json');

export async function GET() {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({});
    }
    return NextResponse.json({ error: 'Failed to read grading scales' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { courseId, scale } = await req.json();
    let data: any = {};
    
    try {
      const fileContent = await fs.readFile(DATA_FILE, 'utf8');
      data = JSON.parse(fileContent);
    } catch (error: any) {
      if (error.code !== 'ENOENT') throw error;
    }

    data[courseId] = scale;

    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save grading scale' }, { status: 500 });
  }
}
