import { NextResponse } from 'next/server';
import { Board } from 'kanbanize';

// Kanban 보드 초기화
const kanbanBoard = new Board({
  columns: ['TODO', 'DOING', 'DONE'], // 기본 열
});

// 기본 카드 추가
kanbanBoard.addCard('TODO', { id: 1, title: 'Task 1', description: 'First task' });
kanbanBoard.addCard('TODO', { id: 2, title: 'Task 2', description: 'Second task' });

// GET 요청: 보드 데이터 가져오기
export async function GET() {
  return NextResponse.json(kanbanBoard.toJSON());
}

// POST 요청: 새 카드 추가
export async function POST(request) {
  const body = await request.json(); // 클라이언트에서 보낸 데이터
  const { column, card } = body;

  try {
    kanbanBoard.addCard(column, card); // 지정된 열에 카드 추가
    return NextResponse.json({ success: true, board: kanbanBoard.toJSON() });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
