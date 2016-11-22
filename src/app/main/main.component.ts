import { Component, OnInit, AfterContentInit} from '@angular/core';
import { Router } from '@angular/router';

import { GridOptions, IFilter } from 'ag-grid/main';

import { JobListService } from './job-list.service';

import * as moment from 'moment';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit, AfterContentInit {

  private gridOptions: GridOptions;
  private showGrid: boolean;
  private rowData: any[];
  private columnDefs: any[];
  private rowCount: string;
  private saveNotification: string = '';

  constructor(
    private router: Router,
    private joblistService: JobListService
  ) {
    // we pass an empty gridOptions in, so we can grab the api out
    this.gridOptions = <GridOptions>{};
    this.createColumnDefs();

    //this.getRowData();
    this.showGrid = true;
   }

   onCellValueChanged(e) {
     this.saveJob()
   }

   private createColumnDefs() {
     this.columnDefs = [
      {
        headerName: "Date",
        children: [
          {
            headerName: "Applied",
            field: "date",
            width: 100,
            suppressSorting: true,
            suppressMenu: true,
            editable: true
          },
          {
            headerName: "Since Applied",
            field: "remaining",
            width: 120
          }
        ]
      },
      {
        headerName: "Company",
        children: [
          {
            headerName: "Name",
            field: "companyName",
            width: 150,
            editable: true
          },
          {
            headerName: "Position",
            field: "position",
            width: 150,
            editable: true
          }
        ]
      },
      {
        headerName: "Contact",
        children: [
          {
            headerName: "Name",
            field: "contactName",
            width: 150,
            editable: true
          },
          {
            headerName: "Email",
            field: "contactEmail",
            width: 150,
            editable: true
          },
          {
            headerName: "Number",
            field: "contactNumber",
            width: 150,
            editable: true
          }
        ]
      },
      {
        headerName: "Comments",
        field: "comments",
        width: 150,
        editable: true
      },
      {
        headerName: "Appointments",
        children: [
          {
            headerName: "Phone Screen",
            field: "phoneScreen",
            width: 150,
            editable: true
          },
          {
            headerName: "Till Screen",
            field: "tillPhoneScreen",
            width: 150
          },
          {
            headerName: "Interview",
            field: "interview",
            width: 150,
            editable: true
          },
          {
            headerName: "Till Interview",
            field: "tillInterview",
            width: 150
          }
        ]
      }
    ]
   }

  ngOnInit() {
    if(document.cookie) {
      const splitCookie = document.cookie.split(';')
      splitCookie.forEach(cookie => {
        if (cookie.indexOf('userId') !== -1) {
          localStorage['userId'] = cookie.slice(7);
        }
        if (cookie.indexOf('username') !== -1) {
          localStorage['username'] = cookie.slice(10);
        }
        if (cookie.indexOf('firstName') !== -1) {
          localStorage['firstName'] = cookie.slice(11)
        }
      })
    }
    
  }

  ngAfterContentInit() {
    var self = this;
    setTimeout(function(){
      self.getRowData(window.localStorage["username"]);
    },500)
    self["name"] = localStorage['firstName'];    
    self["username"] = localStorage['username']
    self["today"] = moment().format('MMMM Do YYYY')
  }



  private getRowData(user: string) {
    this.joblistService.getJobList(user).then(jobList => {
      this.rowData = jobList;
      this.rowData.forEach(function(row) {
        console.log("THIS IS ROW DATA", row)
        var day:any = moment(row.date);
        console.log("this is day", day)
        var today:any = moment().startOf('day');
        if(row.date === null) {
          row["remaining"] = "Invalid Date"
        } else if(Math.round((today - day) / 86400000) === 1) { 
          row["remaining"] = "1 day ago"
        } else {
          row["remaining"] = Math.round((today - day) / 86400000) + " days ago"
        }
        var tillPhoneScreen:any = moment(row.phoneScreen) 
        console.log("what is tillPhoneScreen", row.phoneScreen)
        if(row.phoneScreenDate === null) {
          row["tillPhoneScreen"] = "No Date"
        } else if(Math.round((tillPhoneScreen - today) / 86400000) === 1) { 
          row["tillPhoneScreen"] = "1 day to go"
        } else {
          row["tillPhoneScreen"] = Math.round((tillPhoneScreen - today) / 86400000) + " days to go"
        }
        var tillInterview:any = moment(row.interview) 
        if(row.interviewDate === null) {
          row["tillInterview"] = "No Date"
        } else if(Math.round((tillInterview - today) / 86400000) === 1) { 
          row["tillInterview"] = "1 day to go"
        } else {
          row["tillInterview"] = Math.round((tillInterview - today) / 86400000) + " days to go"
        }
      })
      console.log(moment("2016-11-14T21:56:19.083Z", "YYYY-MM-DDTHH:mm:ss.SSSSZ"), "This is moment");
      console.log(this.rowData)
    })
  }

  private redirectToJob() {
    this.router.navigate(['/job-form']);
  }

  private saveJob() {
    console.log("this is row data", this.rowData);
    this.rowData.forEach(ele => {
      this.joblistService.editJobs(ele).then(updatedList => {

      })
    })
    this.saveNotification = "Job list saved today at " + moment().format('LTS')
  }

  private removeJob() {
    var self = this;
    console.log("removeJob", this.gridOptions.api.getSelectedNodes())
    this.gridOptions.api.getSelectedNodes().forEach(ele => {
      self.joblistService.deleteJob(ele.data.id).then(e => {
        console.log('does it even go here?')
      })
    })
    setTimeout(function(){
      self.getRowData(window.localStorage["username"]);
    },1000)
  }

  private redirectToAccountSettings() {
    this.router.navigate(['/account-settings']);
  }
  private goToJob() {
    if(this.gridOptions.api.getSelectedNodes().length !== 0) {
     this.router.navigate(['/main', this.gridOptions.api.getSelectedNodes()[0].data.id])
    }
  }

  private logout() {
    this.router.navigate(['/splash']);
    localStorage.clear();
    document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.cookie = "firstName=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  }

}
