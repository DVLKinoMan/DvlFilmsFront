import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Filmography, Person } from './person';
import { Gender, ZodiacSign } from './person-query';
import { PersonsService } from './services/persons.service';

@Component({
  selector: 'app-person-edit',
  templateUrl: './person-edit.component.html',
  styleUrls: ['./person-edit.component.css']
})
export class PersonEditComponent implements OnInit {
  model: Person;
  id: number;
  selectedZodiacSign: string;
  personForm: FormGroup;
  editMode: boolean = false;
  selectedFilmographyCatName: string = "";
  filmographyCategoryNames: string[] = [];
  filmographies: Filmography[];

  tiles: any[] = [
    {text: 'One', cols: 3, rows: 1, color: 'lightblue'},
    {text: 'Two', cols: 1, rows: 2, color: 'lightgreen'},
    {text: 'Three', cols: 1, rows: 1, color: 'lightpink'},
    {text: 'Four', cols: 2, rows: 1, color: '#DDBDF1'},
  ];
  zodiacSigns: string[] = Object.keys(ZodiacSign).filter(val => isNaN(Number(val)));
  genders: string[] = Object.keys(Gender).filter(val => isNaN(Number(val)));

  constructor(private service: PersonsService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.personForm = this.formBuilder.group({
      sign: ''
    });
    this.route.params.subscribe(params=>{
        this.id = params['id'];
        this.loadPerson();
    })
  }

  save(){
    var val = this.model.zodiacSign;
  }

  loadFilmItems(){
      if(this.model.filmographies){
          let items: Filmography[] = [];
          let catName = this.selectedFilmographyCatName;
          this.model.filmographies.forEach(function(val){
            if(val.categoryName == catName)
              items.push(val);
          });
          this.filmographies = items;
      }
  }

  loadPerson(){
    this.service.getById(this.id).subscribe(result =>{
          if(result.profilePicture != undefined)
            result.profilePicture.image =  'data:image/png;base64,' + result.profilePicture.image;
          if(result.filmographies)
            result.filmographies.forEach(function(value){
              if(value.filmItem?.photo?.image)
                value.filmItem.photo.image = 'data:image/png;base64,' + value.filmItem.photo.image;
            });
          this.model = result;
          this.selectedFilmographyCatName = this.model.filmographies?.[0].categoryName ?? "";
          this.filmographyCategoryNames = 
          [...new Set(this.model.filmographies?.map(item=>item.categoryName) ?? [])]; ;
          this.loadFilmItems();
    }, error=>console.log(error));
  }
}
