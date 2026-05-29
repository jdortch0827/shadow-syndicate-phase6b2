import React from "react";

function FairPlayBadge({ item }) {
  if (item.status === "REJECTED") {
    return (
      <span className="tribute-badge rejected">
        REJECTED
      </span>
    );
  }

  if (item.fairPlaySafe) {
    return (
      <span className="tribute-badge fair">
        Fair Play: {item.fairPlayType}
      </span>
    );
  }

  return (
    <span className="tribute-badge warning">
      Needs Review
    </span>
  );
}

function getMonthlyKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getDaysOffline(playerState) {
  if (!playerState?.lastSeenAt) return 0;

  const lastSeen = new Date(playerState.lastSeenAt).getTime();

  if (!Number.isFinite(lastSeen)) return 0;

  const diff = Date.now() - lastSeen;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function isCatchUpAvailable(item, playerState) {
  if (item.id !== "back_in_business_bundle") return true;

  const daysOffline = getDaysOffline(playerState);
  const monthlyKey = getMonthlyKey();
  const claimedKey = playerState?.catchUpClaims?.[item.id];

  if (daysOffline < item.eligibility.offlineDaysRequired) return false;
  if (claimedKey === monthlyKey) return false;

  return true;
}

function getDisabledReason(item, playerState) {
  if (item.status === "REJECTED") {
    return item.reason || "Rejected because it creates paid gameplay advantage.";
  }

  if (item.id === "back_in_business_bundle" && !isCatchUpAvailable(item, playerState)) {
    return "Available only after 7+ offline days and only once per month.";
  }

  if ((playerState?.tribute || 0) < item.priceTribute) {
    return "Not enough Tribute.";
  }

  return "";
}

export default function TributeItem({
  item,
  playerState,
  onBuy,
}) {
  const disabledReason = getDisabledReason(item, playerState);
  const disabled = Boolean(disabledReason);

  return (
    <div className={`tribute-item ${item.status === "REJECTED" ? "is-rejected" : ""}`}>
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="tribute-item-image"
        />
      )}

      <div className="tribute-item-body">
        <div className="tribute-item-head">
          <div>
            <p className="kicker">
              {item.category || "Tribute Item"}
            </p>

            <h3>
              {item.name}
            </h3>
          </div>

          <FairPlayBadge item={item} />
        </div>

        <p className="tribute-desc">
          {item.description || item.reason}
        </p>

        {item.status === "REJECTED" && (
          <div className="tribute-rejected-box">
            <strong>REJECTED</strong>
            <span>{item.reason}</span>
          </div>
        )}

        {item.fairPlayNotes && (
          <p className="tribute-notes">
            {item.fairPlayNotes}
          </p>
        )}

        <div className="tribute-info-grid">
          <div className="info">
            <span>Cost</span>
            <strong>{item.priceTribute ?? item.oldPriceTribute ?? 0} Tribute</strong>
          </div>

          <div className="info">
            <span>Status</span>
            <strong>{item.status}</strong>
          </div>

          <div className="info">
            <span>Power</span>
            <strong>{item.effects?.power || 0}</strong>
          </div>

          <div className="info">
            <span>PvP Advantage</span>
            <strong>
              {item.status === "REJECTED" ? "Yes" : "No"}
            </strong>
          </div>
        </div>

        {disabledReason && (
          <p className="tribute-disabled-reason">
            {disabledReason}
          </p>
        )}

        <button
          type="button"
          className={item.status === "REJECTED" ? "danger" : "primary"}
          disabled={disabled}
          onClick={() => onBuy?.(item)}
        >
          {item.status === "REJECTED"
            ? "Rejected"
            : `Buy for ${item.priceTribute} Tribute`}
        </button>
      </div>
    </div>
  );
}