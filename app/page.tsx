// // // 카드 색상을 동적으로 지정 (Index를 활용한 색상 배열 순환)
// // function getCardColor(index: number): string {
// //   const colors = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0', '#3f51b5', '#00bcd4', '#e91e63'];
// //   return colors[index % colors.length]; // Index 기반으로 색상 순환
// // }

// 'use client';

// import { useEffect, useState } from 'react';
// import './globals.css'; // 전체 스타일
// import './kanban.css'; // 칸반 보드 전용 스타일

// interface Card {
//   id: string;
//   row1: string;
//   row2: string;
//   row3: string;
// }

// interface AdditionalCard {
//   index: number; // 추가된 카드의 고유 인덱스
//   title: string;
//   description: string;
// }
// interface KanbanBoard {
//   [column: string]: Card[];
// }

// export default function HomePage() {
//   const [board, setBoard] = useState<KanbanBoard | null>(null);
//   const [additionalCards, setAdditionalCards] = useState<AdditionalCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showPopup, setShowPopup] = useState(false);
//   const [newCard, setNewCard] = useState({
//     column: '',
//     id: '',
//     title: '',
//     description: '',
//   });

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

//   const handleAddCard = () => {
//     if (additionalCards.length >= 20) {
//     alert('20개 이상의 카드를 추가할 수 없습니다.');
//     return;
//     }
//     setShowPopup(true);
//   };

//   const handleSaveCard = async () => {
//     const { column, title, description } = newCard;
//     if (!column || !title || !description) {
//       alert('모든 필드를 입력해야 합니다.');
//       return;
//     }
  
//     const newCardData: AdditionalCard = {
//       index: additionalCards.length + 1, // 현재 배열 길이 + 1
//       title,
//       description,
//     };
  
//     try {
//       const response = await fetch('/api/add-card', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newCardData),
//       });
  
//       if (response.ok) {
//         const savedCard = await response.json(); // 서버에서 저장된 카드 데이터
//         setAdditionalCards((prevCards) => [...prevCards, { ...savedCard, index: prevCards.length + 1 }]);
//         setShowPopup(false);
//         setNewCard({ column: '', id: '', title: '', description: '' }); // 입력 초기화
//       } else {
//         console.error('Failed to save card');
//       }
//     } catch (error) {
//       console.error('Error saving card:', error);
//     }
//   };
  
//   const handleDeleteCard = async (index: number) => {
//     try {
//       const response = await fetch('/api/delete-card', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ index }), // 삭제할 카드의 인덱스를 서버로 전송
//       });
  
//       if (response.ok) {
//         setAdditionalCards((prevCards) =>
//           prevCards
//             .filter((card) => card.index !== index) // 해당 인덱스 제거
//             .map((card, idx) => ({ ...card, index: idx + 1 })) // 인덱스 재배열
//         );
//       } else {
//         console.error('Failed to delete card');
//       }
//     } catch (error) {
//       console.error('Error deleting card:', error);
//     }
//   };
  
//   const handleCardClick = (card: Card) => {
//     alert(`카드 클릭됨!\n\nID: ${card.row1}\nTitle: ${card.row2}\nDescription: ${card.row3}`);
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

//   return (
//     <div className="kanban-container">
//       <button onClick={handleAddCard} className="kanban-add-button">
//         예약 추가
//       </button>
//       {Object.entries(board).map(([column, cards], index) => (
//         <div key={column} className="kanban-column">
//           <h2>{column}</h2>
//           <div>
//             {cards.map((card) => (
//               <div
//                 key={card.id}
//                 className="kanban-card"
//                 onClick={() => handleCardClick(card)}
//               >
//                 <p className="kanban-card-title">{card.row1}</p>
//                 <p className="kanban-card-description">
//                   {card.row2}
//                   <br />
//                   {card.row3}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//       {showPopup && (
//         <div className="kanban-popup">
//           <h2>새 예약 추가</h2>
//           <label>
//             이름:
//             <input
//               type="text"
//               value={newCard.column}
//               onChange={(e) => setNewCard({ ...newCard, column: e.target.value })}
//             />
//           </label>
//           <label>
//             성별:
//             <input
//               type="text"
//               value={newCard.id}
//               onChange={(e) => setNewCard({ ...newCard, id: e.target.value })}
//             />
//           </label>
//           <label>
//             나이:
//             <input
//               type="text"
//               value={newCard.title}
//               onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
//             />
//           </label>
//           <label>
//             유형:
//             <input
//               type="text"
//               value={newCard.description}
//               onChange={(e) => setNewCard({ ...newCard, description: e.target.value })}
//             />
//           </label>
//           <button onClick={handleSaveCard} className="kanban-save-button">
//             저장
//           </button>
//           <button onClick={() => setShowPopup(false)} className="kanban-cancel-button">
//             취소
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import { useEffect, useState } from 'react';
// import './globals.css'; // 전체 스타일
// import './kanban.css'; // 칸반 보드 전용 스타일

// interface Card {
//   id: string;
//   row1: string;
//   row2: string;
//   row3: string;
// }

// interface AdditionalCard {
//   index: number; // 추가된 카드의 고유 인덱스
//   chart_name: string;
//   chart_room: string;
//   chart_insurance: string;
//   chart_date_adm: string;
//   chart_doct: string;
// }

// interface KanbanBoard {
//   [column: string]: Card[];
// }

// export default function HomePage() {
//   const [board, setBoard] = useState<KanbanBoard | null>(null);
//   const [additionalCards, setAdditionalCards] = useState<AdditionalCard[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showPopup, setShowPopup] = useState(false);
//   const [newCard, setNewCard] = useState({
//     chart_name: '',
//     chart_room: '',
//     chart_insurance: '',
//     chart_date_adm: '',
//     chart_doct: '',
//   });

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

//   const handleAddCard = () => {
//     if (additionalCards.length >= 20) {
//       alert('20개 이상의 카드를 추가할 수 없습니다.');
//       return;
//     }
//     setShowPopup(true);
//   };

//   const handleSaveCard = async () => {
//     const { chart_name, chart_room, chart_insurance, chart_date_adm, chart_doct } = newCard;
//     if (!chart_name || !chart_room || !chart_insurance || !chart_date_adm || !chart_doct) {
//       alert('모든 필드를 입력해야 합니다.');
//       return;
//     }

//     const newCardData: AdditionalCard = {
//       index: additionalCards.length + 1, // 현재 배열 길이 + 1
//       chart_name,
//       chart_room,
//       chart_insurance,
//       chart_date_adm,
//       chart_doct,
//     };

//     try {
//       const response = await fetch('/api/add-card', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(newCardData),
//       });

//       if (response.ok) {
//         const savedCard = await response.json(); // 서버에서 저장된 카드 데이터
//         setAdditionalCards((prevCards) => [...prevCards, { ...savedCard, index: prevCards.length + 1 }]);
//         setShowPopup(false);
//         setNewCard({ chart_name: '', chart_room: '', chart_insurance: '', chart_date_adm: '', chart_doct: '' }); // 입력 초기화
//       } else {
//         console.error('Failed to save card');
//       }
//     } catch (error) {
//       console.error('Error saving card:', error);
//     }
//   };

//   const handleDeleteCard = async (index: number) => {
//     try {
//       const response = await fetch('/api/delete-card', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ index }), // 삭제할 카드의 인덱스를 서버로 전송
//       });

//       if (response.ok) {
//         setAdditionalCards((prevCards) =>
//           prevCards
//             .filter((card) => card.index !== index) // 해당 인덱스 제거
//             .map((card, idx) => ({ ...card, index: idx + 1 })) // 인덱스 재배열
//         );
//       } else {
//         console.error('Failed to delete card');
//       }
//     } catch (error) {
//       console.error('Error deleting card:', error);
//     }
//   };

//   const handleCardClick = (card: Card) => {
//     alert(`카드 클릭됨!\n\nID: ${card.row1}\nTitle: ${card.row2}\nDescription: ${card.row3}`);
//   };

//   if (loading) return <p>Loading...</p>;
//   if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

//   return (
//     <div className="kanban-container">
//       <button onClick={handleAddCard} className="kanban-add-button">
//         예약 추가
//       </button>
//       {Object.entries(board).map(([column, cards], index) => (
//         <div key={column} className="kanban-column">
//           <h2>{column}</h2>
//           <div>
//             {cards.map((card) => (
//               <div
//                 key={card.id}
//                 className="kanban-card"
//                 onClick={() => handleCardClick(card)}
//               >
//                 <p className="kanban-card-title">{card.row1}</p>
//                 <p className="kanban-card-description">
//                   {card.row2}
//                   <br />
//                   {card.row3}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       ))}
//       {showPopup && (
//         <div className="kanban-popup">
//           <h2>새 예약 추가</h2>
//           <label>
//             이름:
//             <input
//               type="text"
//               value={newCard.chart_name}
//               onChange={(e) => setNewCard({ ...newCard, chart_name: e.target.value })}
//             />
//           </label>
//           <label>
//             병실:
//             <input
//               type="text"
//               value={newCard.chart_room}
//               onChange={(e) => setNewCard({ ...newCard, chart_room: e.target.value })}
//             />
//           </label>
//           <label>
//             보험:
//             <input
//               type="text"
//               value={newCard.chart_insurance}
//               onChange={(e) => setNewCard({ ...newCard, chart_insurance: e.target.value })}
//             />
//           </label>
//           <label>
//             입원일자:
//             <input
//               type="text"
//               value={newCard.chart_date_adm}
//               onChange={(e) => setNewCard({ ...newCard, chart_date_adm: e.target.value })}
//             />
//           </label>
//           <label>
//             담당의:
//             <input
//               type="text"
//               value={newCard.chart_doct}
//               onChange={(e) => setNewCard({ ...newCard, chart_doct: e.target.value })}
//             />
//           </label>
//           <button onClick={handleSaveCard} className="kanban-save-button">
//             저장
//           </button>
//           <button onClick={() => setShowPopup(false)} className="kanban-cancel-button">
//             취소
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from 'react';
import './globals.css'; // 전체 스타일
import './kanban.css'; // 칸반 보드 전용 스타일

interface Card {
  id: string;
  row1: string;
  row2: string;
  row3: string;
}

interface AdditionalCard {
  index: number; // 추가된 카드의 고유 인덱스
  chart_name: string;
  chart_room: string;
  chart_insurance: string;
  chart_date_adm: string;
  chart_doct: string;
  chart_funnel: string;
  chart_gender: string;
}

interface KanbanBoard {
  [column: string]: Card[];
}

interface RoomStatistics {
  room: string;
  current: number;
  remaining: number | null;
}

interface Statistics {
  doctors: Record<string, number>;
  rooms: RoomStatistics[];
}

// type Stats = {
//   chartDoctCounts: Record<string, number>;
//   columnCounts: Record<string, number>;
// };

export default function HomePage() {
  const [board, setBoard] = useState<KanbanBoard | null>(null);
  const [additionalCards, setAdditionalCards] = useState<AdditionalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [showCardPopup, setShowCardPopup] = useState(false);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [cardDetails, setCardDetails] = useState<AdditionalCard | null>(null);
  const [popupLoading, setPopupLoading] = useState(true);
  const [showStatsPopup, setShowStatsPopup] = useState(false);
  // const [statistics, setStatistics] = useState<{ [key: string]: number }>({});
  const [statistics, setStatistics] = useState<Statistics>({
    doctors: {},
    rooms: [],
  });
  const [newCard, setNewCard] = useState({
    chart_name: '',
    chart_room: '',
    chart_insurance: '',
    chart_date_adm: '',
    chart_doct: '',
    chart_funnel: '',
    chart_gender: '',
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

    // const fetchStats = async () => {
    //   try {
    //     const response = await fetch('/api/kanban/stats');
    //     if (!response.ok) throw new Error('Failed to fetch stats');
    //     const data = await response.json();
    //     setStats(data);
    //   } catch (error) {
    //     console.error('Error fetching stats:', error);
    //   }
    // };

    // fetchStats();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/kanban/stats'); // 서버에서 통계 데이터 가져오기
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // 통계 팝업 열기
  const handleShowStats = async () => {
    await fetchStatistics(); // 통계 가져오기
    setShowStatsPopup(true); // 팝업 표시
  };

  // 통계 팝업 닫기
  const handleCloseStats = () => {
    setShowStatsPopup(false); // 팝업 닫기
  };

  const handleAddCard = () => {
    if (additionalCards.length >= 20) {
      alert('20개 이상의 카드를 추가할 수 없습니다.');
      return;
    }
    setShowPopup(true);
  };

  const handleSaveCard = async () => {
    const { chart_name, chart_room, chart_insurance, chart_date_adm, chart_doct, chart_funnel, chart_gender } = newCard;
    if (!chart_name || !chart_room ) {
      alert('이름과 병실은은 입력해야 합니다.');
      return;
    }

    const newCardData: AdditionalCard = {
      index: additionalCards.length + 1, // 현재 배열 길이 + 1
      chart_name,
      chart_room,
      chart_insurance,
      chart_date_adm,
      chart_doct,
      chart_funnel,
      chart_gender
    };

    try {
      const response = await fetch('/api/kanban', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCardData),
      });

      if (response.ok) {
        const savedCard = await response.json(); // 서버에서 저장된 카드 데이터
        setAdditionalCards((prevCards) => [...prevCards, { ...savedCard, index: prevCards.length + 1 }]);
        setShowPopup(false);
        setNewCard({ chart_name: '', chart_room: '', chart_insurance: '', chart_date_adm: '', chart_doct: '', chart_funnel: '', chart_gender }); // 입력 초기화
      } else {
        console.error('Failed to save card');
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDeleteCard = async (key: string) => {
    try {
      const response = await fetch('/api/kanban', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key }), // 삭제할 카드의 key를 전송
      });
  
      if (response.ok) {
        setBoard((prevBoard) => {
          if (!prevBoard) return null;
  
          // 삭제된 카드 제외
          const updatedBoard = Object.fromEntries(
            Object.entries(prevBoard).map(([column, cards]) => [
              column,
              cards.filter((card) => card.id !== key),
            ])
          );
  
          return updatedBoard;
        });
  
        setShowCardPopup(false); // 팝업 닫기
      } else {
        console.error('Failed to delete card');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };
  

  const handleCardClick = async (card: Card) => {
    setSelectedCard(card); // 선택된 카드 저장
    setPopupLoading(true);
    setShowCardPopup(true);
  
    try {
      const response = await fetch(`/api/kanban/retrieve?key=${card.id}`); // RETRIEVE API 호출
      if (!response.ok) {
        throw new Error('Failed to fetch card details');
      }
      const data: AdditionalCard = await response.json();
      setCardDetails(data); // 데이터 설정
    } catch (error) {
      console.error('Error fetching card details:', error);
      setCardDetails(null); // 데이터가 없을 때
    } finally {
      setPopupLoading(false);
    }
  };

  // const handleSavePopup = () => {
  //   // 선택된 카드의 수정사항 저장 로직 (추후 구현)
  //   setShowCardPopup(false);
  // };

  if (loading) return <p>Loading...</p>;
  if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

  return (
    <div className="kanban-container">
      <button onClick={handleAddCard} className="kanban-add-button">
        예약 추가
      </button>
      <button onClick={handleShowStats} className="stats-button">통계</button>
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
                <p className="kanban-card-title">{card.row1}</p>
                <p className="kanban-card-description">
                  {card.row2}
                  <br />
                  {card.row3}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
      {showStatsPopup && (
        <div className="popup">
          <div className="kanban-popup">
            <h2>통계</h2>
            <ul>
              {Object.entries(statistics.doctors).map(([doctor, count]) => (
                <li key={doctor}>
                  {doctor}: {count}명
                </li>
              ))}
              {statistics.rooms.map((room: RoomStatistics) => (
                <li key={room.room}>
                  {room.room}: {room.current}명, 남은 자리: {room.remaining ?? 'N/A'}명
                </li>
              ))}
            </ul>
            <button onClick={handleCloseStats}>닫기</button>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="kanban-popup">
          <h2>새 예약 추가</h2>
          <label>
            이름:
            <input
              type="text"
              value={newCard.chart_name}
              onChange={(e) => setNewCard({ ...newCard, chart_name: e.target.value })}
            />
          </label>
          <label>
            성별:
            <input
              type="text"
              value={newCard.chart_gender}
              onChange={(e) => setNewCard({ ...newCard, chart_gender: e.target.value })}
            />
          </label>
          <label>
            병실:
            <input
              type="text"
              value={newCard.chart_room}
              onChange={(e) => setNewCard({ ...newCard, chart_room: e.target.value })}
            />
          </label>
          <label>
            보험:
            <input
              type="text"
              value={newCard.chart_insurance}
              onChange={(e) => setNewCard({ ...newCard, chart_insurance: e.target.value })}
            />
          </label>
          <label>
            입원일자:
            <input
              type="text"
              value={newCard.chart_date_adm}
              onChange={(e) => setNewCard({ ...newCard, chart_date_adm: e.target.value })}
            />
          </label>
          <label>
            유입경로:
            <input
              type="text"
              value={newCard.chart_funnel}
              onChange={(e) => setNewCard({ ...newCard, chart_funnel: e.target.value })}
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
      {showCardPopup && selectedCard && (
        <div className="kanban-popup">
          <h2>카드 세부정보</h2>
          {popupLoading ? (
            <p>Loading...</p>
          ) : cardDetails ? (
            <div>
              <p>이름: {cardDetails.chart_name}</p>
              <p>성별: {cardDetails.chart_gender}</p>
              <p>병실: {cardDetails.chart_room}</p>
              <p>보험: {cardDetails.chart_insurance}</p>
              <p>입원일자: {cardDetails.chart_date_adm}</p>
              <p>담당의: {cardDetails.chart_doct}</p>
            </div>
          ) : (
            <p>카드 데이터를 가져오지 못했습니다.</p>
          )}
          <button onClick={() => setShowCardPopup(false)} className="kanban-cancel-button">
            닫기
          </button>
          <button
          onClick={() => handleDeleteCard(selectedCard.id)} // 삭제 버튼에 이벤트 연결
          className="kanban-delete-button"
        >
          삭제
        </button>
        </div>
      )}
    </div>
  );
}
