import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Gender } from "src/app/persons/person-query";
import { Film, FilmCastMember } from "../film";
import { FilmsService } from "../services/films.service";

@Component({
    selector: 'app-film-edit',
    templateUrl: './film-edit.component.html',
    styleUrls: ['./film-edit.component.css']
})

export class FilmEditComponent implements OnInit {
    id: number;
    model: Film;
    fetched?: Film;
    editMode: boolean = false;
    filmForm: FormGroup;

    cast: FilmCastMember[];
    castItemsPerPage: number = 10;
    castCurrPage: number = 0;
    castPagesLength: number = 0;
    allCast: FilmCastMember[];
    leftCastArrowDisabled: boolean = true;
    rightCastArrowDisabled: boolean = false;

    constructor(private service: FilmsService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder) {
        this.route.params.subscribe(item => {
            this.id = item['id'];
            this.loadFilm();
            this.loadCast();
        });
    }
    ngOnInit(): void {
        this.filmForm = this.formBuilder.group({

        });
    }

    setDefaultProfilePicture(event: any, castMember: FilmCastMember) {
        if (typeof castMember.gender == "string")
            event.target.src = castMember.gender == "Female" ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
        else event.target.src = castMember.gender == Gender.Female ? 'assets/DefaultPersonFemale.png' : 'assets/DefaultPersonMale.jpeg'
    }

    fetchFilmFromImdb() {

    }

    save() {

    }

    loadFilm() {
        this.service.getById(this.id).subscribe(result => {
            this.model = result;
        }, error => console.log(error));
    }

    castPageArrowClicked(right: boolean) {
        this.castCurrPage = right ? this.castCurrPage + 1 : this.castCurrPage - 1;
        this.cast = this.allCast.slice(this.castCurrPage * this.castItemsPerPage,
            this.castCurrPage * this.castItemsPerPage + this.castItemsPerPage);
        this.leftCastArrowDisabled = this.castCurrPage < 1;
        this.rightCastArrowDisabled = this.castCurrPage >= this.castPagesLength - 1;
    }

    loadCast() {
        this.service.getCast(this.id).subscribe(result => {
            this.allCast = result;
            this.cast = this.allCast.slice(0, this.castItemsPerPage);
            this.castPagesLength = Math.floor(this.allCast.length / this.castItemsPerPage) +
                (this.allCast.length % this.castItemsPerPage > 0 ? 1 : 0);
            this.leftCastArrowDisabled = true;
            this.rightCastArrowDisabled = this.castPagesLength <= 1;
        }, error => console.log(error));
    }
}