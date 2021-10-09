import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListItem } from "../list.model";


@Component({
    selector: 'app-insertion-sort-list',
    templateUrl: './list-insertion-sort.dialog.component.html',
    styleUrls: ['./list-insertion-sort.dialog.component.css']
})
export class ListInsertionDialogComponent implements OnInit {
    list: ListItem[];

    item: ListItem;
    currIndex: number;
    secondItemIndex: number;
    private start: number;
    private end: number;

    finishedInserting: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<ListInsertionDialogComponent>,) {
        if (data.listItems) {
            this.list = data.listItems;
            this.item = data.item;
            this.start = 0;
            this.end = this.list.length - 1;
            this.secondItemIndex = Math.floor((this.start + this.end) / 2);
        }
    }

    ngOnInit(): void {

    }

    firstItemClick() {
        this.end = this.secondItemIndex - 1;

        if (this.start > this.end) {
            this.currIndex = this.end + 1;
            this.finishedInserting = true;
            return;
        }
        this.secondItemIndex = Math.floor((this.start + this.end) / 2);
    }

    secondItemClick() {
        this.start = this.secondItemIndex + 1;

        if (this.start > this.end) {
            this.currIndex = this.start;
            this.finishedInserting = true;
            return;
        }
        this.secondItemIndex = Math.floor((this.start + this.end) / 2);
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    setDefaultPhoto(event: any) {
        // if (typeof this.model.sex == "string")
        //     event.target.src = this.model.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        // else event.target.src = this.model.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

}

export interface DialogData {
    itemName: string;
    item: ListItem;
    listItems?: ListItem[];
}