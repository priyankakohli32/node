import BaseService from "../services/base.service.js";
import { buildResponse } from "../common/utils.js";
import { errorHandler } from "../common/errors.js";

class BaseController {
  _baseService = new BaseService();

  getPreSignedUrl = async (req, res) => {
    try {
      const urlData = req.body;
      const result = await this._baseService.getPreSignedUrl(urlData);
      return res.status(200).send(buildResponse(result, "Url Signed"));
    } catch (error) {
      errorHandler(res, error);
    }
  };
}

export default BaseController;
