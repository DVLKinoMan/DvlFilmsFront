import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
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
    cast?: FilmCastMember[];

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

    fetchFilmFromImdb() {

    }

    save() {

    }

    loadFilm() {
        this.service.getById(this.id).subscribe(result => {
            this.model = result;
        }, error => console.log(error));
    }

    loadCast() {
        this.service.getCast(this.id).subscribe(result => {
            this.cast = result;
        }, error => console.log(error));
    }
}