import { QRCodeSVG } from 'qrcode.react';
import { Info } from 'lucide-react';

interface BillDetail {
  label: string;
  value: string;
  isSubTotal?: boolean;
  isTotal?: boolean;
}

const billDetails: BillDetail[] = [
  {
    label: "Base Fare",
    value: "10.00€"
  },
  {
    label: "Ride Charges for 150 min",
    value: "300.00€"
  },
  {
    label: "Pause Charges for 25 min",
    value: "25.00€"
  },
  {
    label: "Sub Total",
    value: "335.00€",
    isSubTotal: true
  },
  {
    label: "GST(5%)",
    value: "16.75€"
  },
];

const Bill = () => {
  return (
    <div className='w-full flex flex-col gap-8 items-center px-4'>

      <QRCodeSVG className='w-60 h-60 mx-auto' value="https://reactjs.org/"></QRCodeSVG>
      <div className='w-full border-b-black border-b-2'></div>

      <div className='w-full flex flex-col items-start gap-3'>
        <div className='w-full flex flex-col gap-4'>
          <div className='flex flex-row items-center gap-2'> 
          <h2 className='font-bold text-lg'>Bill Details</h2>
           <Info></Info>
          </div>
          
        <ul className='w-full flex flex-col gap-3'>
          {billDetails.map((info, index) => (
            <li key={index} className='flex justify-between'>
              <span className={`${info.isSubTotal ? "font-bold text-lg" : ""}`}>{info.label}</span>
              <span className={`${info.isSubTotal ? "font-bold text-lg" : ""}`}>{info.value}</span>
            </li>
          ))}
        </ul>
        </div>
       
      </div>

      <div className='w-full border-b-black border-b-2'></div>

        <div className='w-full flex flex-row justify-between items-start text-lg'>
          <h3 className='font-bold'>Total Money</h3>
          <span className='font-bold text-violet-400'>352.00€</span>
        </div>  
    </div>
  )
}

export default Bill
