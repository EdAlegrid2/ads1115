const r = require('array-gpio');

let i2c = r.startI2C(1);    // using SDA1 and SCL1 pins (pin 3 & 5)

/* led conversion indicator (optional) */
let led = r.out(33); 

/* set data transfer speed to 200 kHz */
i2c.setTransferSpeed(200000);

let slave = 0x48; // or 10000100

i2c.selectSlave(slave);

/* setup write and read data buffer */
const wbuf = Buffer.alloc(16); // write buffer
const rbuf = Buffer.alloc(16); // read buffer

//https://www.bristolwatch.com/rpi/ads1115.html

/* configure access config register */
// MSB data to be written to config register
wbuf[0] = 1; // access config register 
//wbuf[1] = 0b11010011; // addr 0x84;	// single shot conversion ACN1
//wbuf[1] = 0b11010010;	// addr 0x84;	// continous conversion, result changes instantaneous ACN0
wbuf[1] = 0b11000010; 	// ANC0 // 0xc2 // continous
//wbuf[1] = 0b11000011; 	// ANC0 // 0xc2 // single shot
  // bit 15 flag bit for single shot
  // Bits 14-12 input selection:
  // 100 ANC0; 101 ANC1; 110 ANC2; 111 ANC3
  // Bits 11-9 Amp gain. Default to 010 here 001 P19
  // Bit 8 Operational mode of the ADS1115.
  // 0 : Continuous conversion mode
  // 1 : Power-down single-shot mode (default)

// LSB data to be written to config register 
wbuf[2] = 0b10000101; // addr 0x83; 
i2c.write(wbuf, 3);	// now, access the register and write the MSB and LSB values to the slave   
  // Bits 7-5 data rate default to 100 for 128SPS
  // Bits 4-0  comparator functions see spec sheet.

/* access the conversion register  */
wbuf[0] = 0; // conversion register 
i2c.write(wbuf, 1);

// volts per step
const vps = 4.096 / 32768.0;

// voltage data source
let vds = exports.vds = function(){

	i2c.read(rbuf, 3);

	var data0 = rbuf[0]; 
	var data1 = rbuf[1];
	var data2 = rbuf[2];

  	var v = data0 << 8 | data1;
	
	if(v < 0){
		v = 0;	
	}
    
    led.pulse(500);    

	var value = v*vps;
	let val = value.toFixed(2);
	//console.log('voltage value', val )

	return val;
}
console.log('voltage value', vds());

