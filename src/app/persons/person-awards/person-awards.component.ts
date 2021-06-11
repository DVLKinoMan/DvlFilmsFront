import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PersonAwardResult } from '../personAwardResult';
import { PersonsService } from '../services/persons.service';

@Component({
    selector: 'app-person-awards',
    templateUrl: './person-awards.component.html',
    styleUrls: ['./person-awards.component.css']
})
export class PersonAwardsComponent implements OnInit {
    personId: number;
    awardResults: PersonAwardResult[];

    constructor(private route: ActivatedRoute,
        private personsService: PersonsService
    ) {

    }

    ngOnInit(): void {
        this.route.params.subscribe(params => {
            this.personId = params['id'];
            this.loadAwards();
        });
    }

    loadAwards() {
        this.personsService.getAwards(this.personId).subscribe(result => {
            this.awardResults = result;
        }, error => console.error(error));
    }
}