export interface FloorTable {
  id: number;
  tableNumber: number;
  capacity: number;
  status: string;
  posX: number;
  posY: number;
  shape: string;
  available?: boolean;
}
