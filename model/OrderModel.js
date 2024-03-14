export class OrderModel {
    constructor(ordId, ordDate, cust, items, total, discount, subtot) {
        this.ordId = ordId;
        this.ordDate = ordDate;
        this.cust = cust;
        this.items = items;
        this.total = total;
        this.discount = discount;
        this.subtot = subtot;
    }
}