import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PersonAwardResult } from '../../personAwardResult';
import { PersonsService } from '../../services/persons.service';

@Component({
    selector: 'app-person-awards-dialog',
    templateUrl: './person-awards-dialog.component.html',
    styleUrls: ['./person-awards-dialog.component.css']
})

export class PersonAwardsDailogComponent implements OnInit {
    awardResults: PersonAwardResult[];

    constructor(
        public dialogRef: MatDialogRef<PersonAwardsDailogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private personsService: PersonsService
    ) {

    }

    ngOnInit(): void {
        // this.route.params.subscribe(params => {
        //     this.personId = params['id'];
        //     this.loadAwards();
        // });
        this.loadAwards();
    }

    loadAwards() {
        this.personsService.getAwards(this.data.personId).subscribe(result => {
            this.awardResults = result;
        }, error => console.error(error));
    }
}

export interface DialogData {
    personId: number;
    personName: string;
}