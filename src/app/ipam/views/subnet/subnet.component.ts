import { HttpEventType } from '@angular/common/http';
import { ThrowStmt } from '@angular/compiler';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ContextMenu } from 'primeng/contextmenu';
import { AlertType, Helper } from '../../../common/helper';
import {
  RequestOptions,
  SearchFilter,
  SortElement,
  SortOrder,
} from '../../../common/models/requestOptions';
import {
  DateSearch,
  DropDownSearch,
  SearchField,
  TextSearch,
} from '../../../common/models/searchField';
import { IpDetail } from '../../models/ipDetail';
import { IpHistory } from '../../models/ipHistory';
import { Subnet } from '../../models/subnet';
import { LoadingDataService } from '../../services/loading-data.service';
import { SubnetService } from '../../services/subnet.service';

declare var $: any;

@Component({
  selector: 'app-subnet',
  templateUrl: './subnet.component.html',
  styleUrls: ['./subnet.component.css'],
  providers: [SubnetService],
})
export class SubnetComponent {
  subnets: Subnet[] = [];
  subnet: Subnet;
  ipDetails: IpDetail[] = [];
  ipHistories: IpHistory[] = [];
  selectedIpDetail: IpDetail = new IpDetail();
  editSelectedIpDetail: IpDetail = new IpDetail();

  statusMessage: string = '';
  modes: string[] = [];
  selectedMode: string = 'view';

  sortElement: SortElement;
  pageSizes = [10, 20, 50, 100];
  pageSize = this.pageSizes[0];
  currentPage = 1;
  totalPages = 1;
  recordCount = 0;
  searchFilter: SearchFilter;
  searchFields: SearchField[];
  fields: string[];
  previousElement: HTMLElement;

  cmenuitems: MenuItem[];

  pageTitle: string;
  width = 0;
  editWidth = 0;
  subnetId ="";
  eChartOptions: any;

  constructor(
    private subnetService: SubnetService,
    public dialog: MatDialog,
    private helper: Helper,
    private route: ActivatedRoute,
    private loaderService: LoadingDataService
  ) {
    this.cmenuitems = [
      { label: 'Ping', command: (item) => this.testIP(item) },
      // { label: 'SNMP Ping', command: (item) => this.testIP(item) },
      // { label: 'Resolve DNS', command: (item) => this.testIP(item) },
      // { label: 'Resolve MAC Address', command: (item) => this.testIP(item) },
      { label: 'Trace Route', command: (item) => this.testIP(item) },
      // { label: 'System Explorer', command: (item) => this.testIP(item) },
    ];       
  }

  ngOnInit() {
    this.generateAvailabilityChart();
    this.getFormData();       
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.subnetId = params.get('Id');
      this.getSubnetIpData(this.subnetId);
      this.getIpHistories(this.subnetId);
      this.getSubnetDetail(this.subnetId);
    })
  }

  getSubnetIpData(subnet:string) {
    this.statusMessage = "Loading data...";
    this.subnetService.getSubnetIps(subnet).subscribe((data) => {
      this.ipDetails = data;
    });
  }

  getSubnetDetail(subnetId:string) {
    this.statusMessage = "Loading data...";
    this.subnetService.getSubnetDetail(subnetId).subscribe((data) => {
      this.ipDetails = data;
    });
  }

  scanIP(subnetIpId:string) {
    this.loaderService.showLoader();
    this.subnetService.scanIP(subnetIpId).subscribe((data) => {  
      this.ipDetails.map((ip) => {
        if(ip.subnetIPId === subnetIpId)
        {
          ip.macAddress = data.macAddress,
          ip.status = data.status,
          ip.deviceType = data.deviceType,
          ip.connectedSwitch = data.connectedSwitch,
          ip.lastScan = data.lastScan
        }
      })
      this.loaderService.hideLoader();
    });
  }

  getIpHistories(subnetId) {
    this.statusMessage = "Loading data...";
    this.subnetService.getIpHistories(subnetId).subscribe((data) => {
      this.ipHistories = data;
    })
  }

  getFormData() {
    //$("#ajax-loading").show();

    // let requestOptions: RequestOptions = {
    //   page: this.currentPage,
    //   pageSize: this.pageSize,
    //   searchFilter: this.searchFilter,
    //   sortElement: this.sortElement,
    //   fields: this.fields
    // };

    this.statusMessage = 'Loading data...';

    // this.subnetService.getSubnets(requestOptions).subscribe(
    //   resp => {

    //     if (resp.status.toLowerCase() == "error") {
    //       this.statusMessage = 'Error loading subnets';
    //       this.helper.showMessage(resp.message, AlertType.Error);
    //       this.clearSubnets();
    //     }
    //     else {
    //       if (resp.data != null && resp.data.length > 0) {
    //         this.subnets = resp.data;
    //         this.totalPages = Math.ceil(resp.recordCount / this.pageSize);
    //         this.recordCount = resp.recordCount;
    //         this.statusMessage = '';
    //       }
    //       else {
    //         this.statusMessage = "No subnets added.";
    //         this.clearSubnets();
    //       }
    //     }

    //     $("#ajax-loading").hide();
    //   },
    //   (err) => {
    //     $("#ajax-loading").hide();
    //     this.clearSubnets();
    //     this.helper.showMessage(`Error loading subnets : ${err || err.message}`, AlertType.Error);
    //     this.statusMessage = "Error loading subnets.";
    //   });
  }

  openCM(event: MouseEvent, contextMenu: ContextMenu, ipDetail: any) {
    event.preventDefault();
    event.stopPropagation();
    this.selectedIpDetail = ipDetail;
    contextMenu.show(event);
    return false;
  }

  testIP(ip) {
    this.pageTitle = ip.item.label;
    this.width = 100;
  }

  editIpDetails(ipDetail) {
    this.editSelectedIpDetail = ipDetail;   
    this.editWidth = 100;    
  }

  closeDiv(width) {    
    this.selectedIpDetail = new IpDetail();
    this.width = width;
  }

  closeDivEdit(width) {    
    this.editSelectedIpDetail = new IpDetail();
    this.editWidth = width;
  }

  generateAvailabilityChart(){
    this.eChartOptions = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        bottom: 'bottom',
        data: [
          {
            icon: 'circle',
            name: 'Not Reachable',
            itemStyle: {
              color: '#6c757d'
            }
          },
          {
            icon: 'circle',
            name: 'Available',
            itemStyle: {
              color: '#28a745'
            }
          },
          {
            icon: 'circle',
            name: 'Transient',
            itemStyle: {
              color: '#ffc107'
            }
          },
          {
            icon: 'circle',
            name: 'Used',
            itemStyle: {
              color: '#dc3545'
            }
          },
        ],
      },
      series: [
        {
          type: 'pie',
          radius: '50%',
          data: [
            { 
              value: 200, 
              name: 'Not Reachable',
              itemStyle: {
                color: '#6c757d'
              }
            },
            { 
              value: 535, 
              name: 'Available',
              itemStyle: {
                color: '#28a745'
              } 
            },
            { 
              value: 125, 
              name: 'Transient',
              itemStyle: {
                color: '#ffc107'
              }
            },
            { 
              value: 335, 
              name: 'Used',
              itemStyle: {
                color: '#dc3545'
              } 
            },
          ],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  // clearSubnets() {
  //   this.subnets.length = 0;
  //   this.totalPages = 1;
  //   this.recordCount = 0;
  // }

  // onColumnClick(e: any) {

  //   if (e.getAttribute('data-column') == "" || e.getAttribute('data-column') == null) return;

  //   let sortColumn = e.getAttribute('data-column');
  //   let parentNode = <HTMLElement>e;

  //   if (sortColumn == "" || sortColumn == null) return;

  //   if (this.previousElement && sortColumn != this.previousElement.getAttribute('data-column')) {
  //     let prevParentNode = <HTMLElement>this.previousElement.parentNode;

  //     prevParentNode.classList.remove('table-sorter-desc');
  //     prevParentNode.classList.remove('table-sorter-asc');
  //   }

  //   this.previousElement = e;

  //   let sortOrder = SortOrder.descending;

  //   if (parentNode.classList.contains("table-sorter-asc")) {
  //     parentNode.classList.remove('table-sorter-asc');
  //     parentNode.classList.add('table-sorter-desc');
  //     sortOrder = SortOrder.descending;
  //   }
  //   else if (parentNode.classList.contains("table-sorter-desc")) {
  //     parentNode.classList.remove('table-sorter-desc');
  //     //sortColumn = null;
  //     sortOrder = SortOrder.noSort;
  //   }
  //   else {
  //     parentNode.classList.add('table-sorter-asc');
  //     sortOrder = SortOrder.ascending;
  //   }

  //   this.sortElement = { propertyName: sortColumn, sortOrder: sortOrder };
  //   this.getFormData();
  // }

  // onSearchClick($event: any) {
  //   this.searchFilter = $event;
  //   this.currentPage = 1;
  //   this.getFormData();
  // }

  // onPageSizeChange(pageSize: number) {
  //   this.pageSize = pageSize;
  //   this.currentPage = 1;
  //   this.getFormData();
  // }

  // onPageChange(currentPage: number) {
  //   this.currentPage = currentPage;
  //   this.getFormData();
  // }

  // downloadList() {

  //   let fields = JSON.parse(JSON.stringify(this.fields));
  //   fields = fields.filter(ele => { return ele != "Id"; });

  //   let requestOptions: RequestOptions = {
  //     searchFilter: this.searchFilter,
  //     sortElement: this.sortElement,
  //     fields: fields
  //   };

  //   $("#ajax-loading").show();

  //   this.subnetService.downloadSubnets(requestOptions).subscribe(
  //     (event) => {

  //       if (event.type === HttpEventType.Response) {
  //         $("#ajax-loading").hide();
  //        // Download File
  //       }
  //     },
  //     (err) => {
  //       $("#ajax-loading").hide();
  //       this.helper.showMessage(`Error downloading subnets : ${err || err.message}`, AlertType.Error);
  //     });
  // }

  // add() {
  //   this.subnet = new Subnet();
  //   this.selectedMode = "edit";
  //   $('.float-box').toggleClass('float-box-hide');
  // }

  // async save() {

  //   $("#ajax-loading").show();

  //   var errorMessages = await this.validateItem(this.subnet);

  //   if (errorMessages.length == 0) {

  //     this.subnetService.save(this.subnet).subscribe(
  //       resp => {

  //         $("#ajax-loading").hide();

  //         if (resp.status.toLowerCase() == "error") {
  //           this.helper.showMessage(resp.message, AlertType.Error);
  //         }
  //         else {
  //           if (resp.data != null) {
  //             this.helper.showMessage(`${this.subnet.address} information saved`, AlertType.Success);
  //             this.close();
  //             this.getFormData();
  //           }
  //           else
  //             this.helper.showMessage("Unable to save item information.", AlertType.Error);
  //         }
  //       },
  //       (err) => {
  //         $("#ajax-loading").hide();
  //         this.helper.showMessage(`Unable to save ${this.subnet.address} information : ${err || err.message}`, AlertType.Error);
  //       });
  //   }
  //   else {
  //     $("#ajax-loading").hide();
  //     this.helper.showMessage(Helper.getErrorMessagesText(errorMessages), AlertType.Error);
  //   }
  // }

  // async validateItem(subnet: Subnet): Promise<string[]> {
  //   var errorMessages = [];

  //   return errorMessages;
  // }

  // close() {
  //   $('.float-box').toggleClass('float-box-hide');
  // }
}
