// 'use client';

// import { useEffect, useState } from 'react';

// interface Card {
//   id: string;
//   title: string;
//   description: string;
// }

// interface KanbanBoard {
//   [column: string]: Card[];
// }

// export default function HomePage() {
//   const [board, setBoard] = useState<KanbanBoard | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchBoard = async () => {
//       try {
//         const response = await fetch('/api/kanban'); // API 호출
//         if (!response.ok) {
//           throw new Error('Failed to fetch board data');
//         }
//         const data: KanbanBoard = await response.json();
//         setBoard(data);
//       } catch (error) {
//         console.error('Error fetching board data:', error);
//         setBoard(null); // 데이터가 없을 경우 null로 설정
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBoard();
//   }, []);

//   if (loading) return <p>Loading...</p>;
//   if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

//   return (
//     <div>
//       <h1>입원 리스트</h1>
//       <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
//         {Object.entries(board).map(([column, cards]) => (
//           <div key={column} style={{ margin: '20px', flex: '0 0 7%' }}>
//             <h2>{column}</h2>
//             <ul>
//               {cards.map((card) => (
//                 <li key={card.id}>
//                   <strong>{card.title}</strong>: {card.description}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

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

  const handleCardClick = (card: Card) => {
    alert(`카드 클릭됨!\n\nID: ${card.id}\nTitle: ${card.title}\nDescription: ${card.description}`);
  };

  if (loading) return <p>Loading...</p>;
  if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

  return (
    <div style={{ 
      display: 'flex', 
      gap: '2%', /* 칼럼 간 간격 설정 */
      padding: '20px', 
      justifyContent: 'space-between', /* 여유 공간을 양쪽 끝에 배치 */
      width: '80%', /* 부모 컨테이너의 너비를 80%로 설정 */
      margin: '10' /* 가운데 정렬 */
    }}>
      {Object.entries(board).map(([column, cards]) => (
        <div key={column} style={{ flex: '0 0 10%' }}>
          <h2 style={{ textAlign: 'center', backgroundColor: '#eee', padding: '10px' }}>{column}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {cards.map((card, index) => (
              <div
                key={card.id}
                onClick={() => handleCardClick(card)}
                style={{
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '5px',
                  color: '#fff',
                  textAlign: 'center',
                  backgroundColor: getCardColor(index),
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <strong>{card.title}</strong>
                <p style={{ fontSize: '0.9em', marginTop: '5px' }}>{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>    
  );
}

// 카드 색상을 동적으로 지정 (Index를 활용한 색상 배열 순환)
function getCardColor(index: number): string {
  const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#3f51b5', '#00bcd4', '#e91e63'];
  return colors[index % colors.length]; // Index 기반으로 색상 순환
}
