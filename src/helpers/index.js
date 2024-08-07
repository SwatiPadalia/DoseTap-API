export const successResponse = (req, res, data, code = 200) => res.send({
  code,
  data,
  success: true,
});

export const errorResponse = (
  req,
  res,
  errorMessage = 'Something went wrong',
  code = 500,
  error = {},
) => res.status(500).json({
  code,
  errorMessage,
  error,
  data: null,
  success: false,
});

export const validateEmail = (email) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

export const validateFields = (object, fields) => {
  const errors = [];
  fields.forEach((f) => {
    if (!(object && object[f])) {
      errors.push(f);
    }
  });
  return errors.length ? `${errors.join(', ')} are required fields.` : '';
};

export const uniqueId = (length = 13) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const uniqueCode = (type, wordLength, numlength, username) => {

  // check for the username length
  if (username.length > 1) {

    // check for word length 
    if (typeof (wordLength) !== 'number') {
      return 'word length to chunk must be a number';
    } else {

      // check if username length is greater than word length
      if (username.length > wordLength) {

        // extract code word
        let chunked_name = username.slice(0, wordLength);

        // check for wordcase
        if (type != null) {

          // check wordcase type
          if (type == 'uppercase') {

            // check for random number length
            if (numlength > 1) {

              // generate random number
              // Math.floor(100000 + Math.random() * 900000)
              let code = Math.floor(Math.pow(10, numlength - 1) + Math.random() * 9 * Math.pow(10, numlength - 1));

              // referral code
              return chunked_name.toUpperCase() + '' + code;
            } else {
              return 'random number length is required.';
            }
          } else if (type == 'lowercase') {

            // check for random number length
            if (numlength > 1) {

              // generate random number
              let code = Math.floor(Math.pow(10, numlength - 1) + Math.random() * 9 * Math.pow(10, numlength - 1));

              // referral code
              return chunked_name.toLowerCase() + '' + code;
            } else {
              return 'random number length is required.';
            }
          } else {

            // check for random number length
            if (numlength > 1) {

              // generate random number
              let code = Math.floor(Math.pow(10, numlength - 1) + Math.random() * 9 * Math.pow(10, numlength - 1));

              // referral code
              return chunked_name + '' + code;
            } else {
              return 'random number length is required.';
            }
          }
        } else {

          // generate random number
          let code = Math.floor(100000 + Math.random() * 900000)

          // referral code
          return chunked_name + '' + code;
        }
      } else {
        return 'username\'s length should be greater than word length.';
      }
    }
  } else {
    return 'username is required.';
  }
}

export async function updateOrCreate(model, where, newItem) {
  // First try to find the record
  const foundItem = await model.findOne({ where });
  if (!foundItem) {
    // Item not found, create a new one
    const item = await model.create(newItem)
    return { item, created: true };
  }
  // Found an item, update it
  const item = await model.update(newItem, { where });
  return { item, created: false };
}


export function getAge(dateString) {
  var today = new Date();
  var birthDate = new Date(dateString);
  var age = today.getFullYear() - birthDate.getFullYear();
  var m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
  }
  return age;
}
