export class Query {
    currentPage: number;
    pageSize: number;
    constructor(currPage: number = 1, pageSize: number = 10) {
        this.currentPage = currPage;
        this.pageSize = pageSize;
    }
}