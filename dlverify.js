const puppeteer = require('puppeteer');
const readlineSync = require('readline-sync');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto('https://parivahan.gov.in/rcdlstatus/?pur_cd=101');

  
  const dlNo = readlineSync.question('Enter your driving license number (e.g., XX00 20001234567): ');
  const dateOfBirth = readlineSync.question('Enter your date of birth (DD-MM-YYYY): ');

  
  await page.type('#form_rcdl\\:tf_dlNO', dlNo);

  await page.evaluate((dateOfBirth) => {
    const dateOfBirthInput = document.querySelector('#form_rcdl\\:tf_dob_input');
    dateOfBirthInput.value = dateOfBirth;
  }, dateOfBirth);

  await page.evaluate(() => {
    const captchaPnl = document.querySelector('#form_rcdl\\:captchaPnl');
    if (captchaPnl) {
      captchaPnl.remove();
    }
  });

  await page.click('#form_rcdl\\:j_idt43');

  await page.waitForTimeout(1000);

  const extractedDate = await page.evaluate(() => {
    const tdElements = document.querySelectorAll('td');

    for (const tdElement of tdElements) {
      const textContent = tdElement.textContent.trim();

      if (textContent.startsWith('To:')) {
        return textContent.replace('To:', '').trim();
      }
    }

    return null;
  });

  
  if (extractedDate) {
    const currentDate = new Date();
    const extractedDateParts = extractedDate.split('-');
    const extractedDateObj = new Date(
      `${extractedDateParts[2]}-${extractedDateParts[1]}-${extractedDateParts[0]}`
    );

    if (currentDate < extractedDateObj) {
      console.log('Your driving license is valid.');
    } else {
      console.log('Your driving license has expired.');
    }
  } else {
    console.log('Unable to extract the license expiry date.');
  }

  await browser.close();
})();
