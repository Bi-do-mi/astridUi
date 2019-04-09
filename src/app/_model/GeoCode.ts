export interface IGeoCodeResult {
  alternative_names: string;
  boundingbox: number[];
  display_name: string;
  housenumbers: string;
  lon: number;
  lat: number;
  name: string;
  name_suffix: string;
  type: string;
}


export class GeoCode {
  count: number;
  nextIndex: number;
  startIndex: number;
  totalResults: number;
  results: IGeoCodeResult[];
}
