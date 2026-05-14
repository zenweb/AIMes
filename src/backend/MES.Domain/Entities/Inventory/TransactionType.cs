namespace MES.Domain.Entities.Inventory;

public enum TransactionType
{
    StockIn,
    StockOut,
    TransferIn,
    TransferOut,
    Adjustment,
    Reservation,
    ReservationRelease,
}
