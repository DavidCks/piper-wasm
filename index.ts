import axios from "axios";
import { initModule } from "./app";
import { init as sherpaInit } from "./sherpa-onnx-wasm-main";

class Piper {
  url: string;
  module: Object;

  constructor(
    url: string,
    onInit: (generateFunction: (text: string) => void) => void,
    debug: boolean = true
  ) {
    this.url = url;
    if (debug) {
      this.validateUrls().then((validations) => {
        // Filter out validations where the URL does not exist
        const failedValidations = validations.filter(
          (validation) => !validation.exists
        );

        // Log an error message for each failed validation
        failedValidations.forEach((failedValidation) => {
          console.error(`Validation failed for URL: ${failedValidation.url}`);
        });
      });
    }
    this.module = initModule(onInit);
    sherpaInit(this.module);
  }

  async validateUrls(): Promise<{ url: string; exists: boolean }[]> {
    const validations = [this.url].map(async (url) => {
      try {
        // Making a HEAD request to check if the URL exists without downloading the content
        await axios.head(url);
        return { url, exists: true };
      } catch (error) {
        // If the request fails, assume the URL does not exist or is inaccessible
        return { url, exists: false };
      }
    });

    return Promise.all(validations);
  }
}

export default Piper;
