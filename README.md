## Raspberry Pi communication with ADS1115/1015 ADC 16/12 BIT I2C using array-gpio library

In this example, we will measure the Raspberry Pi 3.3V supply voltage using ADC1115/1015 ADC I2C module. We will use the array-gpio library to communicate with the ADS1115/1015 ADC. We will also use a simple potentiometer to simulate different voltage level for measurement. 
Note: Input voltage should not exceed 3.3V supply voltage.

![](assets/ads1115.svg)

## Setup

### 1. Create a project directory and install array-gpio.
```js
$ npm install array-gpio
```
### 2. Save the code below as app.js in your project directory.
```js
const r = require('array-gpio');

let i2c = r.startI2C(1);    // using SDA1 and SCL1 pins (pin 3 & 5)

/* led conversion indicator (optional) */
//let led = r.out(33); 

/* set data transfer speed to 200 kHz */
i2c.setTransferSpeed(200000);

/* using the default address */
i2c.selectSlave(0x48);

/* setup write and read data buffer */
const wbuf = Buffer.alloc(16); // write buffer
const rbuf = Buffer.alloc(16); // read buffer

/* access config register */
wbuf[0] = 0x1; // config register address 

/* MSB data to be written to config register */
wbuf[1] = 0b11000010;   // continous conversion using AIN0 input
//wbuf[1] = 0b11000011;	// single shot conversion using AIN0 input
  // bit 15 flag bit for single shot
  // Bits 14-12 input selection:
  // 100 ANC0; 101 ANC1; 110 ANC2; 111 ANC3
  // Bits 11-9 Amp gain. Defaults to 010. In this example, we'll set it to 001 : FSR = ±4.096 V
  // Bit 8 Operational mode
  // 0 : Continuous conversion mode
  // 1 : Power-down single-shot mode (default)

/* using AIN1 input */
//wbuf[1] = 0b11010011; // single shot conversion using AIN1 input 
//wbuf[1] = 0b11010010;	// continous conversion using AIN1 input
//wbuf[1] = 0b11010011; // single shot conversion using AIN1 input 
//wbuf[1] = 0b11010010;	// continous conversion using AIN1 input

/* LSB data to be written to config register */
wbuf[2] = 0b10000101;
  // Bits 7-5 data rate default to 100 for 128SPS
  // Bits 4-0  comparator functions see spec sheet.

/* write the MSB and LSB values to the config register */
i2c.write(wbuf, 3); 

/* access the conversion register  */
wbuf[0] = 0x0; // conversion register address
i2c.write(wbuf, 1);

/* smallest voltage resolution per step or LSB (Least-significant bit) - the smallest level that an ADC can convert
 * below is some info from datasheet for single-ended input only (AIN0~AIN3 to ground) */
const vps = 4.096/32768;  // for ads1115 where FS ADC value is 7FFFh = 32768, expected value is 1.25 mV where LSB = FSR/2
//const vps = 4.096/32752;  // for ads1015 where FS ADC value is 7FF0h = 32752, expected value is ~1.25 mV where LSB = FSR/2

/* calculate voltage data source */
let vds = exports.vds = function(){

    	/* start reading the conversion register */
	i2c.read(rbuf, 2);

	let msb = rbuf[0]; // MSB data of conversion register
	let lsb = rbuf[1]; // LSB data of conversion register

    	// adc value
  	let adc = msb << 8 | lsb;
	
	if(adc < 0){
		adc = 0;	
	}
  
  	/* pulse the led to indicate the conversion process (optional) */
  	//led.pulse(500);    

	let val = adc * vps;
	let value = val.toFixed(2); // result should be rounded to 2 decimal places e.g 2.34, 1.48 V

	return value;
}

// expected output 0 ~ 3.03 v range
console.log('voltage value', vds());

```
### 3. Start your application.
```js
$ sudo node app.js
```

### 4. The expected output should be 0 to 3.03 V.
```js
$ voltage value 2.43 
```
