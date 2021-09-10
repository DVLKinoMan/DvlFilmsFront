import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ListItem } from "../list.model";


@Component({
    selector: 'app-sort-list',
    templateUrl: './list-sort.dialog.component.html',
    styleUrls: ['./list-sort.dialog.component.css']
})
export class ListSortDialogComponent implements OnInit {
    model: ListItem[];

    lists: ListItem[][];
    currentList: ListItem[];

    firstList: ListItem[];
    secondList: ListItem[];
    selectedFirstListIndex: number;
    selectedSecondListIndex: number;

    finishedSorting: boolean = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData,
        public dialogRef: MatDialogRef<ListSortDialogComponent>,) {
        if (data.listItems)
            this.model = data.listItems;
    }

    ngOnInit(): void {
        this.lists = [];
        this.currentList = [];

        this.model.forEach(item => {
            var l = [];
            l.push(item);
            this.lists.push(l);
        });

        this.firstList = this.lists[0];
        this.secondList = this.lists[1];
        this.selectedFirstListIndex = 0;
        this.selectedSecondListIndex = 0;
    }

    firstItemClick() {
        this.currentList.push(this.firstList[this.selectedFirstListIndex]);

        var isFirstListLastElement = this.selectedFirstListIndex == this.firstList.length - 1;

        if (isFirstListLastElement) {
            if (this.selectedSecondListIndex < 1)
                this.currentList = this.currentList.concat(this.secondList);
            else
                this.currentList = this.currentList.concat(this.secondList.slice(this.selectedSecondListIndex));
            this.lists.push(this.currentList);

            //this.lists.Remove(this.firstList);
            //this.lists.Remove(this.secondList);
            this.lists.shift();
            this.lists.shift();
            this.currentList = [];

            if (this.lists.length == 1) {
                this.finishSorting();
                return;
            }
            else {
                this.firstList = this.lists[0];
                this.secondList = this.lists[1];
                this.selectedFirstListIndex = 0;
                this.selectedSecondListIndex = 0;
            }
        }
        else this.selectedFirstListIndex++;
    }

    secondItemClick() {
        this.currentList.push(this.secondList[this.selectedSecondListIndex]);

        var isSecondListLastElement = this.selectedSecondListIndex == this.secondList.length - 1;

        if (isSecondListLastElement) {
            if (this.selectedFirstListIndex < 1)
                this.currentList = this.currentList.concat(this.firstList);
            else
                this.currentList = this.currentList.concat(this.firstList.slice(this.selectedFirstListIndex));
            this.lists.push(this.currentList);

            //this.lists.Remove(this.firstList);
            //this.lists.Remove(this.secondList);
            this.lists.shift();
            this.lists.shift();
            this.currentList = [];

            if (this.lists.length == 1) {
                this.finishSorting();
                return;
            }
            else {
                this.firstList = this.lists[0];
                this.secondList = this.lists[1];
                this.selectedFirstListIndex = 0;
                this.selectedSecondListIndex = 0;
            }
        }
        else this.selectedSecondListIndex++;
    }

    onCloseClick() {
        this.dialogRef.close();
    }

    finishSorting() {
        this.model = this.lists[0];
        this.finishedSorting = true;
    }

    setDefaultPhoto(event: any) {
        // if (typeof this.model.sex == "string")
        //     event.target.src = this.model.sex == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
        // else event.target.src = this.model.sex == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.png'
    }

}

export interface DialogData {
    itemName: string;
    listItems?: ListItem[];
}