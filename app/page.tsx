// // 카드 색상을 동적으로 지정 (Index를 활용한 색상 배열 순환)
// function getCardColor(index: number): string {
//   const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#3f51b5', '#00bcd4', '#e91e63'];
//   return colors[index % colors.length]; // Index 기반으로 색상 순환
// }

'use client';

import { useEffect, useState } from 'react';
import './globals.css'; // 전체 스타일
import './kanban.css'; // 칸반 보드 전용 스타일

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
  const [showPopup, setShowPopup] = useState(false);
  const [newCard, setNewCard] = useState({
    column: '',
    id: '',
    title: '',
    description: '',
  });

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

  const handleAddCard = () => {
    setShowPopup(true);
  };

  const handleSaveCard = async () => {
    try {
      const response = await fetch('/api/add-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCard),
      });

      if (response.ok) {
        const updatedBoard = await response.json();
        setBoard(updatedBoard);
        setShowPopup(false);
        setNewCard({ column: '', id: '', title: '', description: '' }); // 초기화
      } else {
        console.error('Failed to save card');
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleCardClick = (card: Card) => {
    alert(`카드 클릭됨!\n\nID: ${card.id}\nTitle: ${card.title}\nDescription: ${card.description}`);
  };

  if (loading) return <p>Loading...</p>;
  if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

  return (
    <div className="kanban-container">
      <button onClick={handleAddCard} className="kanban-add-button">
        예약 추가
      </button>
      {Object.entries(board).map(([column, cards], index) => (
        <div key={column} className="kanban-column">
          <h2>{column}</h2>
          <div>
            {cards.map((card) => (
              <div
                key={card.id}
                className="kanban-card"
                onClick={() => handleCardClick(card)}
              >
                <strong>{card.title}</strong>
                <p>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {showPopup && (
        <div className="kanban-popup">
          <h2>새 예약 추가</h2>
          <label>
            Column:
            <input
              type="text"
              value={newCard.column}
              onChange={(e) => setNewCard({ ...newCard, column: e.target.value })}
            />
          </label>
          <label>
            Card ID:
            <input
              type="text"
              value={newCard.id}
              onChange={(e) => setNewCard({ ...newCard, id: e.target.value })}
            />
          </label>
          <label>
            Title:
            <input
              type="text"
              value={newCard.title}
              onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
            />
          </label>
          <label>
            Description:
            <input
              type="text"
              value={newCard.description}
              onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
            />
          </label>
          <button onClick={handleSaveCard} className="kanban-save-button">
            저장
          </button>
          <button onClick={() => setShowPopup(false)} className="kanban-cancel-button">
            취소
          </button>
        </div>
      )}
    </div>
  );
}
