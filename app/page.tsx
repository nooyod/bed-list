"use client";

import { useEffect, useState } from 'react';
import './globals.css'; // 전체 스타일
import './kanban.css'; // 칸반 보드 전용 스타일
import { predefinedColumns, doctorMap } from '@/lib/config';
import StatsTable from "@/components/StatsTable";

interface Card {
  id: string;
  row1: string;
  row2: string;
  row3: string;
  origin: string;
  today: string;
  gender: string;
  name: string;
  number: string;
  date_dc: string;
  date_dc_check: string;
  doct: string;
  insurance: string;
  memo: string;
  funnel: string;
  date_stay: number;
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
  gender: string;
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
    fetchStatistics(); // 통계 데이터 가져오기
  }, []);

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
        await fetchBoard(); // 보드 데이터 다시 가져오기
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

  const insuranceClass = (insurance: string) => {
    switch (insurance) {
      case "급1":
        return "bg-blue-200 text-blue-800";
      case "급2":
        return "bg-blue-200 text-blue-800";
      case "산재":
        return "bg-red-200 text-red-800";
      case "자보":
        return "bg-yellow-200 text-yellow-800";
      case "건보":
        return "bg-green-200 text-green-800";
      default:
        return "bg-gray-200 text-gray-800"; // 기본 색상
    }
  };

  const doctorClass = (doctor: string) => {
    switch (doctor) {
      case "1":
        return "bg-green-600 text-white";
      case "2":
        return "bg-red-600 text-white";
      case "ㅊ":
        return "bg-yellow-200 text-black";
      case "ㅈ":
        return "bg-blue-600 text-white";
      case "ㅌ":
        return "bg-purple-600 text-white";
    }
  };

  const funnelClass = (funnel: string) => {
    switch (funnel) {
      case "전":
        return "bg-violet-800 text-white";
        // return { backgroundImage: "linear-gradient(to right, #34D399,rgb(97, 82, 231))", color: "white" };
      case "이":
        return "bg-slate-500 text-white";
        // return { backgroundImage: "linear-gradient(to right, #FB7185, #F43F5E)", color: "white" };
      case "임":
        return "bg-cyan-600 text-white";
        // return { backgroundImage: "linear-gradient(to right, #FDE68A, #FCD34D)", color: "black" };
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!board || Object.keys(board).length === 0) return <p>No board data available</p>;

  return (
    <div className="kanban-container">
    <div className="kanban-header flex items-center justify-between gap-4">
    <div className="flex gap-2">
      <button onClick={handleAddCard} className="kanban-add-button">추가</button>
      <button onClick={handleShowStats} className="stats-button">통계</button>
    </div>
      <div className="stats-table-container"><StatsTable data={statistics.sortedDoctors} /></div>
      </div>
      {Object.entries(board).map(([column, cards]) => (
          <div 
          key={column} 
          className={`kanban-column ${
            (statistics.rooms.find((room) => room.room === column)?.gender === "남자") ? "kanban-column-male" : 
            (statistics.rooms.find((room) => room.room === column)?.gender === "여자") ? "kanban-column-female" : ""
          }`}
        >
          <h2>{column}</h2>
          <div>
            {cards.map((card) => (
              <div
                key={card.id}
                className={`kanban-card 
                  ${card.origin === "reserve" ? "kanban-card-reserve" : card.origin === "change" ? "kanban-card-change" : "kanban-card-current"} 
                  ${card.today === "today" ? "kanban-card-today" : ""}
                  ${card.gender === "남자" || card.gender === "남" ? "kanban-card-male" : card.gender === "여자" || card.gender === "여" ? "kanban-card-female" : ""}
                  `}
                
                onClick={() => handleCardClick(card)}
              >
                    {card.origin === "current" ? (
      <>
                <div className="flex items-center justify-between">
                <p className="kanban-card-title items-left mr-2 text-l font-bold">{card.name}</p>
                <span className="inline-flex items-right text-gray-500">{card.number}</span>
                </div>

                {card.row2 === " " ? <br /> : <p className="kanban-card-date">{card.row2}</p>}
                <div className="flex items-center justify-between row3">                
                <div className="flex items-center">
                  <span className={`inline-flex items-left justify-center rounded-full custom-circle
                    ${doctorClass(card.doct)}`}>{card.doct}</span>
                  <span className={`inline-flex items-left px-2 py-0.4 rounded-full text-xs font-semibold
                    ${insuranceClass(card.insurance)}`}>{card.insurance}</span>
                <span className="inline-flex items-left">{card.memo}</span>

                </div>
                <div className="flex items-center">
                <span className={`inline-flex items-right px-0.5 py-0.4 text-xs font-semibold ${funnelClass(card.funnel)}`}>
                  {card.funnel}
                </span>
              </div>
                {/* <span
  className="inline-flex items-right px-0.5 py-0.4 text-xs font-semibold"
  style={funnelClass(card.funnel)}
>
  {card.funnel}
</span> */}
                </div>
                </>
    ) : (
      <div className="alternative-content">
        {/* reserve와 change의 경우 다른 내용 출력 */}
        <p className="kanban-card-title">{card.row1}</p>
                <p className="kanban-card-description">
                  {card.row2}
                  <br />
                  {card.row3}
                </p>
      </div>
    )}
              </div>
            ))}
          </div>
            {/* 고스트 카드 추가 */}
  {(() => {
    const roomData = statistics.rooms.find((room) => room.room === column);
    const remainingSlots = roomData && roomData.remaining !== null ? roomData.remaining : 0;
    return Array.from({ length: remainingSlots }).map((_, index) => (
      <div key={`ghost-${column}-${index}`} className="kanban-card kanban-card-ghost">
        {/* 빈 카드 형태만 표시 */}
      </div>
    ));
  })()}
        </div>
      ))}
      {showStatsPopup && (
        <div className="popup">
          <div className="kanban-popup">
            <ul>
              {/* {Object.entries(statistics.sortedDoctors).map(([doctor, count]) => (
                <li key={doctor}>
                  {doctor}: {count}명
                </li>
              ))} */}
              <h1>[남은 자리]</h1>
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
                      {total.gender}: {totalPeople} ({roomDetails})
                    </li>
                  )
                );
              })}
              <br></br>
              <h1>[입원 예정]</h1>
                {statistics.reserve.map((entry: { date: string; patients: { name: string; gender: string }[] }) => (
                <li key={entry.date}>
                  {/* 날짜 출력 */}
                  {entry.date ? `${entry.date.slice(4, 6)}/${entry.date.slice(6, 8)}` : "[대기]"}
                  {/* {entry.date.slice(4, 6)}/{entry.date.slice(6, 8)} */}
                  <ul>
                    {/* 해당 날짜의 환자 목록 출력 */}
                    {entry.patients.map((patient, index) => (
                      <li key={index}>
                        {patient.name}({patient.gender})
                      </li>
                    ))}
                    <br></br>
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
            유형:
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
              value={
                newCard.chart_date_adm
                  ? `${newCard.chart_date_adm.slice(0, 4)}-${newCard.chart_date_adm.slice(4, 6)}-${newCard.chart_date_adm.slice(6, 8)}`
                  : ''
              }
              onChange={(e) => setNewCard({ ...newCard, chart_date_adm: e.target.value.replace(/-/g, '') })}
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
          <h2>환자 세부 정보</h2>
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
                        <option value="" disabled>병실</option>
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
                    유형: 
                    <input
                      type="text"
                      value={editedDetails.chart_insurance || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_insurance: e.target.value }))
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
                      checked={!!editedDetails.chart_check_dc}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({
                          ...prev,
                          chart_check_dc: e.target.checked ? new Date().toISOString().split('T')[0].replace(/-/g, '') : ''
                        }))
                      }
                    />
                  </label>
                  <label>
                    메모: 
                    <textarea
                      value={editedDetails.chart_memo || ''}
                      onChange={(e) =>
                        setEditedDetails((prev) => ({ ...prev, chart_memo: e.target.value }))
                      }
                      className='memo-input'
                    ></textarea>
                  </label>
                </div>
              ) : (
                <div>
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
          <button
            onClick={() => {
              if (window.confirm("정말로 삭제하시겠습니까?")) {
              handleDeleteCard(selectedCard.id)}
            }
          }
            className="kanban-delete-button"
          >
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
