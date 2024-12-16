'use client';

import { useEffect, useState } from 'react';

interface Card {
  id: string;
  title: string;
  description: string;
}

interface KanbanBoard {
  [column: string]: Card[];
}

export default function HomePage() {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await fetch('/api/kanban'); // API 호출
        if (!response.ok) {
          throw new Error('Failed to fetch board data');
        }
        const data: KanbanBoard = await response.json();
        setBoard(data);
      } catch (error) {
        console.error('Error fetching board data:', error);
        setBoard(null); // 데이터가 없을 경우 null로 설정
      } finally {
        setLoading(false);
      }
    };

    fetchBoard();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

  return (
    <div>
      <h1>입원 리스트</h1>
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
        {Object.entries(board).map(([column, cards]) => (
          <div key={column} style={{ margin: '20px', flex: '0 0 7%' }}>
            <h2>{column}</h2>
            <ul>
              {cards.map((card) => (
                <li key={card.id}>
                  <strong>{card.title}</strong>: {card.description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
