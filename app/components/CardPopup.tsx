"use client";

import React, { useEffect, useState } from "react";
import "../kanban.css";

interface Card {
  id: string;
  chart_name: string;
  chart_room: string;
  chart_insurance: string;
  chart_date_adm: string;
  chart_doct2: string;
  chart_gender: string;
  chart_memo: string;
}

interface CardPopupProps {
  cardId: string; // 카드 ID만 전달
  onSave: (data: Partial<Card>) => void;
  onClose: () => void;
}

const CardPopup: React.FC<CardPopupProps> = ({ cardId, onSave, onClose }) => {
  const [cardDetails, setCardDetails] = useState<Card | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDetails, setEditedDetails] = useState<Partial<Card>>({});

  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        const response = await fetch(`/api/kanban/retrieve?key=${cardId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch card details");
        }
        const data = await response.json();
        
        // source 추가 설정 (API가 반환하는 데이터에 source가 포함되어야 함)
        setCardDetails({ ...data, source: data.source || "current" });
      } catch (error) {
        console.error("Error fetching card details:", error);
        setCardDetails(null);
      }
    };
  
    if (cardId) {
      fetchCardDetails();
    }
  }, [cardId]);
  

  const handleEdit = () => {
    setIsEditing(true);
    setEditedDetails(cardDetails || {});
  };

  const handleSave = () => {
    if (!editedDetails) return;
    onSave(editedDetails);

    // 수정된 데이터를 카드 세부정보에 병합
    setCardDetails((prev) => {
      if (!prev) return null; // null 방어 코드
      return { ...prev, ...editedDetails } as Card; // 타입 병합 및 캐스팅
    });

    setIsEditing(false);
  };

  const handleSaveEdits = async () => {
    if (!editedDetails.id) return;
  
    const updatedCard = {
      id: editedDetails.id,
      source: cardDetails, // current.json 또는 reserve.json의 소스 정보
      ...editedDetails,
    };
  
    try {
      const response = await fetch('/api/kanban/retrieve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedCard),
      });
  
      if (!response.ok) {
        throw new Error(`Failed to update card: ${response.statusText}`);
      }
  
      const data = await response.json();
      setCardDetails(data.data); // 서버에서 수정된 데이터를 다시 받아서 상태 업데이트
      setIsEditing(false); // 수정 모드 종료
      alert('카드가 성공적으로 수정되었습니다.');
    } catch (error) {
      console.error('Error saving edits:', error);
      alert('카드 수정 중 오류가 발생했습니다.');
    }
  };

  if (!cardDetails) return <p>Loading...</p>;

  return (
    <div className="kanban-popup">
      <h2>카드 세부정보</h2>
      {isEditing ? (
        <div>
          <label>
            이름:
            <input
              type="text"
              value={editedDetails.chart_name || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_name: e.target.value,
                }))
              }
            />
          </label>
          <label>
            병실:
            <input
              type="text"
              value={editedDetails.chart_room || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_room: e.target.value,
                }))
              }
            />
          </label>
          <label>
            보험:
            <input
              type="text"
              value={editedDetails.chart_insurance || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_insurance: e.target.value,
                }))
              }
            />
          </label>
          <label>
            입원일자:
            <input
              type="date"
              value={editedDetails.chart_date_adm || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_date_adm: e.target.value,
                }))
              }
            />
          </label>
          <label>
            담당의:
            <input
              type="text"
              value={editedDetails.chart_doct2 || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_doct2: e.target.value,
                }))
              }
            />
          </label>          
          <label>
            메모:
            <input
              type="text"
              value={editedDetails.chart_memo || ""}
              onChange={(e) =>
                setEditedDetails((prev) => ({
                  ...prev,
                  chart_memot: e.target.value,
                }))
              }
            />
          </label>
          <button onClick={handleSave}>저장</button>
          <button onClick={() => setIsEditing(false)}>취소</button>
        </div>
      ) : (
        <div>
          <p>이름: {cardDetails.chart_name}</p>
          <p>병실: {cardDetails.chart_room}</p>
          <p>보험: {cardDetails.chart_insurance}</p>
          <p>입원일자: {cardDetails.chart_date_adm}</p>
          <p>담당의: {cardDetails.chart_doct2}</p>
          <p>메모: {cardDetails.chart_memo}</p>
          <button onClick={handleEdit} className="kanban-save-button">수정</button>
          <button onClick={onClose} className="kanban-save-button">닫기</button>
        </div>
      )}
    </div>
  );
};

export default CardPopup;
