const fs = require('fs');

const getImage = async (req, res) => {
  const { imageName } = req.params;
  const readStream = fs.createReadStream(
    `/assets/day_details_uploads/${imageName}`
  );
  readStream.pipe(res);
};
export default getImage;
