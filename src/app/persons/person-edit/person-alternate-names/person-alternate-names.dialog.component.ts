import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlternateName } from '../../person';
import { PersonAwardResult } from '../person-awards/personAwardResult';
import { PersonsService } from '../../services/persons.service';

@Component({
    selector: 'app-person-alternate-names-dialog',
    templateUrl: './person-alternate-names.dialog.component.html',
    styleUrls: ['./person-alternate-names.dialog.component.css']
})

export class PersonAlternateNamesDailogComponent implements OnInit {
    showNewAlternateName: boolean = false;
    newAlternateName: AlternateName = new AlternateName;

    constructor(
        public dialogRef: MatDialogRef<PersonAlternateNamesDailogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData
    ) {

    }

    ngOnInit(): void {

    }

    addAlternateName() {
        this.data.alternateNames.push(this.newAlternateName);
        this.newAlternateName = new AlternateName;
        this.showNewAlternateName = false;
    }

    removeAlternateName(altName: AlternateName) {
        var index = this.data.alternateNames.indexOf(altName);

        if (index >= 0)
            this.data.alternateNames.splice(index, 1);
    }

    onCloseClick() {
        this.dialogRef.close();
    }
}

export interface DialogData {
    personName: string;
    alternateNames: AlternateName[];
    editMode: boolean;
}