import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Person } from './person';
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

  loadPerson(){
    this.service.getById(this.id).subscribe(result =>{
          if(result.profilePicture != undefined)
            result.profilePicture.image =  'data:image/png;base64,' + result.profilePicture.image;
          this.model = result;
          // this.personForm.get('sign')?.setValue(this.model.zodiacSign);
    }, error=>console.log(error));
  }
}
