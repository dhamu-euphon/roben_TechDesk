import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { Storage } from '@ionic/storage';
import { HTTP } from '@ionic-native/http/ngx';
import * as moment from 'moment';
import { AppGlobals } from '../app.globals';
import { ScheduleList } from '../models/schedule-list';

const STORAGE_REQ_KEY = 'schedules';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  schedules = new BehaviorSubject([]);

  constructor(private _global: AppGlobals, private http: HTTP, private storage: Storage) {
    if (!localStorage.hasOwnProperty('lastRefresh')) {
      localStorage.setItem("lastRefresh", moment(new Date()).toISOString());
    }
  }

  getData(scheduleDate: Date, forceRefresh: boolean = false): Observable<ScheduleList[]> {
    if (!navigator.onLine) {
      localStorage.setItem("lastRefresh", moment(new Date()).toISOString());
      return this.getSchedules(scheduleDate);
    } else {
      let data = {
        access_token: localStorage.getItem('access_token'),
        userId: localStorage.getItem('user_id'),
        scheduleDate: moment(scheduleDate).format('DD/MM/YYYY')
      };
      localStorage.setItem("lastRefresh", moment(new Date()).toISOString());
      return from(this.http.post(this._global.API_URL + '/api/scheduleDetails', data, {}).then(
        response => {
          let data = JSON.parse(response.data);
          this.insertSchedules(data.details.scheduleList, scheduleDate);
          localStorage.setItem("lastRefresh", moment(new Date()).toISOString());
          let list = data.details.scheduleList.map(function (arr) {
            let scheduleList: ScheduleList = {
              jobNumber: arr.jobNumber,
              scheduleNumber: arr.scheduleNumber,
              port: arr.port,
              vessel: arr.vessel,
              contactDetails: arr.contactDetails,
              jobSummary: arr.jobSummary,
              instructions: arr.instructions,
              priority: arr.priority,
              checkin: arr.checkin,
              scheduleDate: arr.scheduleDate,
              scheduleId: arr.scheduleId
            }
            return scheduleList;
          });
          return list;
        }
      ));
    }
    return;
  }

  public getSchedules(scheduleDate) {
    return from(this.storage.get(STORAGE_REQ_KEY).then(storedOperations => {
      let list = JSON.parse(storedOperations);
      let data = [];
      for (let i = 0; i < list.length; i++) {
        if (parseInt(list[i].scheduleId) === parseInt(moment(scheduleDate).format('DDMMYYYY'))) {
          data.push(list[i]);
        }
      }
      return data;
    }));
  }

  private insertSchedules(data, scheduleDate) {
    let list: ScheduleList[] = [];
    list = data.map(d => {
      d.scheduleDate = moment(scheduleDate).format('DD/MM/YYYY');
      d.scheduleId = moment(scheduleDate).format('DDMMYYYY');
      return d;
    });
    if (data.length) {
      this.storage.get(STORAGE_REQ_KEY).then(objs => {
        let storedObj = [];
        if (objs != null) {
          let temp = JSON.parse(objs);
          for (let i = 0; i < temp.length; i++) {
            if (parseInt(temp[i].scheduleId) !== parseInt(moment(scheduleDate).format('DDMMYYYY'))) {
              storedObj.push(temp[i]);
            }
          }
        }

        if (storedObj) {
          storedObj = storedObj.concat(data);
        } else {
          storedObj = [data];
        }
        this.storage.set(STORAGE_REQ_KEY, JSON.stringify(storedObj));
      });
    }
  }

}
