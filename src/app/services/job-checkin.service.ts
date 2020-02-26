import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobCheckinService {

  constructor() {
    if (!localStorage.hasOwnProperty('JobCheckin')) {
      localStorage.setItem("JobCheckin", "0");
    }
  }

  validate(jobnumber) {
    if (localStorage.hasOwnProperty('JobCheckin')) {
      let officecheckin = localStorage.getItem('office_checkin');
      if (officecheckin == '1') {
        if (localStorage.getItem('JobCheckin') == "0") {
          return "";
        } else {
          return "You are already check-in to a job.";
        }
      } else {
        return "Please check-in to office.";
      }
    }
    return "";
  }

  checkin(jobnumber) {
    localStorage.setItem("JobCheckin", jobnumber);
    return this.isCheckedIn();
  }

  checkout(jobnumber) {
    if (localStorage.hasOwnProperty('JobCheckin')) {
      localStorage.setItem("JobCheckin", "0");
    }
  }

  checkStatus(jobnumber) {
    if (localStorage.hasOwnProperty('JobCheckin')) {
      if (localStorage.getItem("JobCheckin") == jobnumber) return true;
    }
    return false;
  }

  isCheckedIn() {
    if (localStorage.getItem("JobCheckin") != "0") {
      return true;
    }
    return false;
  }

}
