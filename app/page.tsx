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
interface Total {
  gender: string;
  "2인실": number;
  "4인실": number;
  "다인실": number;
}

interface Statistics {
  doctors: Record<string, number>;
  rooms: RoomStatistics[];
  total: Total[];
}

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
  const [statistics, setStatistics] = useState<Statistics>({
    doctors: {},
    rooms: [],
    total: [],
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
              <br></br>
              {/* {statistics.rooms.map((room: RoomStatistics) => (
                <li key={room.room}>
                  {room.room}: {room.current}명, 남은 자리: {room.remaining ?? 'N/A'}명
                </li>
              ))} */}
              {/* {statistics.total.map((total: Total) => (
                <li key={total.gender}>
                  {total.gender}: {total["2인실"]+total["4인실"]+total["다인실"]}, (2인 {total["2인실"] ?? 'N/A'}, 4인 {total["4인실"] ?? 'N/A'}, 다인 {total["다인실"] ?? 'N/A'})
                </li>
              ))} */}
              {statistics.total.map((total: Total) => {
                // "2인실", "4인실", "다인실" 중 값이 0이 아닌 것만 필터링
                const roomDetails = Object.entries(total)
                  .filter(([key, value]) => key !== "gender" && value > 0)
                  .map(([key, value]) => `${key} ${value}`)
                  .join(", ");

                // 총 인원을 계산
                const totalPeople = total["2인실"] + total["4인실"] + total["다인실"];

                return (
                  totalPeople > 0 && ( // 총 인원이 0일 경우 출력하지 않음
                    <li key={total.gender}>
                      {total.gender}: {totalPeople}, ({roomDetails})
                    </li>
                  )
                );
              })}
            </ul>
            <button onClick={handleCloseStats} className="kanban-save-button">닫기</button>
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
