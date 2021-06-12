import { Component } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Film } from "../film";
import { FilmsService } from "../services/films.service";

@Component({
    selector: 'app-film-edit',
    templateUrl: './film-edit.component.html',
    styleUrls: ['./film-edit.component.css']
})

export class FilmEditComponent {
    id: number;
    model: Film;
    fetched?: Film;
    editMode: boolean = false;
    filmForm: FormGroup;

    constructor(private service: FilmsService,
        private route: ActivatedRoute) {
        this.route.params.subscribe(item => {
            this.id = item['id'];
            this.loadFilm();
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
}