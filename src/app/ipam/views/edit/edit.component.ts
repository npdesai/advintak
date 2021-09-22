import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
    selector: 'app-edit',
    templateUrl: './edit.component.html',
    styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {
    @Input() openWidth = 0;
    @Input() scopeName: string;
    @Input() scopeComments: string;
    
    _pageTitle: any;
    get pageTitle(): any {
      return this._pageTitle;
    }
    @Input('pageTitle') set pageTitle(value) {
      this._pageTitle = value;
    }
    @Output() pageTitleChange = new EventEmitter<any>();
    @Output() openWidthChange = new EventEmitter<any>();
    @Output() closeWidth = new EventEmitter<any>();

    //isUpdate: boolean = true;
    ngOnInit() : void {
    }

    onCancel() {
        this.closeWidth.emit(0);
    }

    onUpdate() {
        //this.isUpdate = !this.isUpdate;
    }
}