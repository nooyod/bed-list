"use client";

import { useEffect, useState } from 'react';
import './globals.css'; // 전체 스타일
import './kanban.css'; // 칸반 보드 전용 스타일
import { predefinedColumns, doctorMap } from '@/lib/config';

interface Card {
  id: string;
  row1: string;
  row2: string;
  row3: string;
  origin: string;
  today: string;
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
  chart_age: number;
  chart_date_stay: number;
  chart_date_dc: string;
  chart_check_dc: string;
  chart_doct2: string;
  chart_memo: string;
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
  sortedDoctors: Record<string, number>;
  rooms: RoomStatistics[];
  total: Total[];
  reserve: { date: string; patients: { name: string; gender: string }[] }[];
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Partial<AdditionalCard>>({});
  const [statistics, setStatistics] = useState<Statistics>({
    sortedDoctors: {},
    rooms: [],
    total: [],
    reserve: [],
  });
  const [newCard, setNewCard] = useState({
    chart_name: '',
    chart_room: '',
    chart_insurance: '',
    chart_date_adm: '',
    chart_doct: '',
    chart_funnel: '',
    chart_gender: '',
    chart_age: '',
    chart_date_dc: '',
    chart_doct2: '',
    chart_memo: '',
  });

  // fetchBoard 함수 정의
const fetchBoard = async () => {
  try {
    const response = await fetch('/api/kanban'); // API 호출
    if (!response.ok) {
      throw new Error('Failed to fetch board data');
    }
    const data: KanbanBoard = await response.json();
    setBoard(data); // 상태 업데이트
  } catch (error) {
    console.error('Error fetching board data:', error);
    setBoard(null); // 데이터가 없을 경우 null로 설정
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchBoard(); // 데이터 가져오기
}, []);

  // useEffect(() => {
  //   const fetchBoard = async () => {
  //     try {
  //       const response = await fetch('/api/kanban'); // API 호출
  //       if (!response.ok) {
  //         throw new Error('Failed to fetch board data');
  //       }
  //       const data: KanbanBoard = await response.json();
  //       setBoard(data);
  //     } catch (error) {
  //       console.error('Error fetching board data:', error);
  //       setBoard(null); // 데이터가 없을 경우 null로 설정
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchBoard();
  // }, []);

  useEffect(() => {
    if (cardDetails) {
      setEditedDetails({ ...cardDetails });
    }
  }, [cardDetails]);

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
    const { chart_name, chart_room, chart_insurance, chart_date_adm, chart_doct, chart_funnel, chart_gender, chart_age, chart_date_dc, chart_doct2, chart_memo, } = newCard;
    if (!chart_name || !chart_room ) {
      alert('이름과 병실은 입력해야 합니다.');
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
      chart_gender,
      chart_age: Number(chart_age),
      chart_date_dc,
      chart_date_stay: 0,
      chart_check_dc: '',
      chart_doct2,
      chart_memo,
    };

    try {
      const response = await fetch('/api/kanban/retrieve', {
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
        setNewCard({ chart_name: '', chart_room: '', chart_insurance: '', chart_date_adm: '', chart_doct: '', chart_funnel: '', chart_gender: '', chart_age: '', chart_date_dc: '', chart_doct2: '', chart_memo: '', }); // 입력 초기화
        await fetchBoard(); // 보드 데이터 다시 가져오기
      } else {
        console.error('Failed to save card');
      }
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  const handleDeleteCard = async (key: string) => {
    try {
      const response = await fetch('/api/kanban/retrieve', {
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
    setIsEditing(true);
  
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

  const handleSavePopup = async () => {
    try {
      const response = await fetch('/api/kanban/retrieve', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: selectedCard?.id || '',
          updates: editedDetails,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update card details');
      }
  
      const updatedData = await response.json();
      setCardDetails(updatedData); // 수정된 데이터로 카드 세부정보 갱신
      setIsEditing(false);
      setShowCardPopup(false);
      await fetchBoard(); // 보드 데이터 다시 가져오기
    } catch (error) {
      console.error('Error updating card details:', error);
      alert('카드 수정에 실패했습니다.');
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
      {Object.entries(board).map(([column, cards]) => (
        <div key={column} className="kanban-column">
          <h2>{column}</h2>
          <div>
            {cards.map((card) => (
              <div
                key={card.id}
                // className={`kanban-card ${card.origin === "reserve" ? "kanban-card-reserve" : "kanban-card-current"}`}
                className={`kanban-card 
                  ${card.origin === "reserve" ? "kanban-card-reserve" : card.origin === "change" ? "kanban-card-change" : "kanban-card-current"} 
                  ${card.today === "today" ? "kanban-card-today" : ""}`}
                
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
              {Object.entries(statistics.sortedDoctors).map(([doctor, count]) => (
                <li key={doctor}>
                  {doctor}: {count}명
                </li>
              ))}
              <br></br>
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
              <br></br>
                {statistics.reserve.map((entry: { date: string; patients: { name: string; gender: string }[] }) => (
                <li key={entry.date}>
                  {/* 날짜 출력 */}
                  {entry.date}
                  <ul>
                    {/* 해당 날짜의 환자 목록 출력 */}
                    {entry.patients.map((patient, index) => (
                      <li key={index}>
                        {patient.name}({patient.gender})
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
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
            <select
              value={newCard.chart_gender}
              onChange={(e) => setNewCard({ ...newCard, chart_gender: e.target.value })}
              >
                <option value="" disabled></option>
                <option value="남자">남</option>
                <option value="여자">여</option>
                <option value="모름">모름</option>
            </select>
          </label>
          <label>
            병실:
            <select
              value={newCard.chart_room}
              onChange={(e) => setNewCard({ ...newCard, chart_room: e.target.value })}
              >
                <option value="" disabled>병실</option>
                {predefinedColumns.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
            </select>
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
              type="date"
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
              {isEditing ? (
                <div>
                  <label>
                    이름: 
                    <input
                      type="text"
                      value={editedDetails.chart_name || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_name: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    나이: 
                    <input
                      type="number"
                      value={editedDetails.chart_age || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_age: Number(e.target.value) }))
                      }
                    />
                  </label>
                  <label>
                    성별: 
                    <select
                      value={editedDetails.chart_gender}
                      onChange={(e) => setEditedDetails((prev) => ({ ...prev, chart_gender: e.target.value }))}
                      >
                        <option value="" disabled></option>
                        <option value="남자">남</option>
                        <option value="여자">여</option>
                        <option value="모름">모름</option>
                    </select>
                  </label>
                  <label>
                    병실: 
                    <select
                      value={editedDetails.chart_room}
                      onChange={(e) => setEditedDetails((prev) => ({ ...prev, chart_room: e.target.value }))}
                      >
                        <option value="" disabled>병실을 선택하세요</option>
                        {predefinedColumns.map((room) => (
                          <option key={room} value={room}>
                            {room}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    담당: 
                    <select
                      value={editedDetails.chart_doct2}
                      onChange={(e) => setEditedDetails((prev) => ({ ...prev, chart_doct2: e.target.value }))}
                      >
                        <option value="" disabled>원장님</option>
                        {Object.values(doctorMap).map((department, index) => (
                        <option key={index} value={department}>
                          {department}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    유입: 
                    <input
                      type="text"
                      value={editedDetails.chart_funnel || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_funnel: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    기간: 
                    <input
                      type="number"
                      value={editedDetails.chart_date_stay || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_date_stay: Number(e.target.value) }))
                      }
                      className='stay-input'
                      disabled
                    />
                    일
                  </label>
                  <label>
                    입원:
                    <input
                      type="date"
                      value={
                        editedDetails.chart_date_adm
                          ? `${editedDetails.chart_date_adm.slice(0, 4)}-${editedDetails.chart_date_adm.slice(4, 6)}-${editedDetails.chart_date_adm.slice(6, 8)}`
                          : ''
                      }
                      onChange={(e) =>
                        setEditedDetails((prev) => ({
                          ...prev,
                          chart_date_adm: e.target.value.replace(/-/g, ''), // date 형식을 yyyymmdd로 변환
                        }))
                      }
                    />
                  </label>
                  <label>
                    퇴원: 
                    <input
                      type="date"
                      value={editedDetails.chart_date_dc || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_date_dc: e.target.value }))
                      }
                    />
                  </label>
                  <label>
                    퇴원확정:
                    <input
                      type="checkbox"
                      checked={!!editedDetails.chart_date_dc}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({
                          ...prev,
                          chart_date_dc: e.target.checked ? new Date().toISOString().split('T')[0].replace(/-/g, '') : ''
                        }))
                      }
                    />
                  </label>
                  <label>
                    메모: 
                    <input
                      type="text"
                      value={editedDetails.chart_memo || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_memo: e.target.value }))
                      }
                    />
                  </label>
                </div>
              ) : (
                <div>
                  {/* <p>이름: {cardDetails.chart_name}</p>
                  <p>성별: {cardDetails.chart_gender}</p>
                  <p>나이: {cardDetails.chart_age}</p>
                  <p>병실: {cardDetails.chart_room}</p>
                  <p>담당: {cardDetails.chart_doct}</p>
                  <p>입원: {cardDetails.chart_date_adm}</p>
                  <p>퇴원: {cardDetails.chart_date_dc}</p>
                  <p>메모: {cardDetails.chart_memo}</p> */}
                </div>
              )}
            </div>
          ) : (
            <p>카드 데이터를 가져오지 못했습니다.</p>
          )}
          <button onClick={() => setShowCardPopup(false)} className="kanban-cancel-button">
            닫기
          </button>
          <button onClick={handleSavePopup} className="kanban-save-button">
            저장
          </button>
          {/* {isEditing ? (
            <button onClick={handleSavePopup} className="kanban-save-button">
              저장
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="kanban-save-button">
              수정
            </button>
          )} */}
          <button
            onClick={() => handleDeleteCard(selectedCard.id)}
            className="kanban-delete-button"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
