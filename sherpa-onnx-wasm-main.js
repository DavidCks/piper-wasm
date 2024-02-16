import { sherpaWASM } from "./sherpa-wasm.js";

export function init(Module, data) {
  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }
  Module.expectedDataFileDownloads++;
  (function (_data) {
    if (Module["ENVIRONMENT_IS_PTHREAD"] || Module["$ww"]) return;
    var loadPackage = function (metadata) {
      var PACKAGE_URL = _data["PACKAGE_NAME"];
      var REMOTE_PACKAGE_BASE =
        PACKAGE_URL.split("/")[PACKAGE_URL.split("/").length - 1];
      var PACKAGE_NAME = `..bin/${REMOTE_PACKAGE_BASE}`;
      if (
        typeof Module["locateFilePackage"] === "function" &&
        !Module["locateFile"]
      ) {
        Module["locateFile"] = Module["locateFilePackage"];
        err(
          "warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"
        );
      }
      var REMOTE_PACKAGE_NAME = Module["locateFile"]
        ? Module["locateFile"](REMOTE_PACKAGE_BASE, "")
        : REMOTE_PACKAGE_BASE;
      var REMOTE_PACKAGE_SIZE = metadata["remote_package_size"];
      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        callback(_data["DATA"]);
      }
      function handleError(error) {
        console.error("package error:", error);
      }
      var fetchedCallback = null;
      var fetched = Module["getPreloadedPackage"]
        ? Module["getPreloadedPackage"](
            REMOTE_PACKAGE_NAME,
            REMOTE_PACKAGE_SIZE
          )
        : null;
      if (!fetched)
        fetchRemotePackage(
          REMOTE_PACKAGE_NAME,
          REMOTE_PACKAGE_SIZE,
          function (data) {
            if (fetchedCallback) {
              fetchedCallback(data);
              fetchedCallback = null;
            } else {
              fetched = data;
            }
          },
          handleError
        );
      function runWithFS() {
        function assert(check, msg) {
          if (!check) throw msg + new Error().stack;
        }
        Module["FS_createPath"]("/", "espeak-ng-data", true, true);
        Module["FS_createPath"]("/espeak-ng-data", "lang", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "aav", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "art", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "azc", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "bat", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "bnt", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "ccs", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "cel", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "cus", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "dra", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "esx", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "gmq", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "gmw", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "grk", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "inc", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "ine", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "ira", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "iro", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "itc", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "jpx", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "map", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "miz", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "myn", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "poz", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "roa", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "sai", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "sem", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "sit", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "tai", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "trk", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "urj", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "zle", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "zls", true, true);
        Module["FS_createPath"]("/espeak-ng-data/lang", "zlw", true, true);
        Module["FS_createPath"]("/espeak-ng-data", "voices", true, true);
        Module["FS_createPath"]("/espeak-ng-data/voices", "!v", true, true);
        function DataRequest(start, end, audio) {
          this.start = start;
          this.end = end;
          this.audio = audio;
        }
        DataRequest.prototype = {
          requests: {},
          open: function (mode, name) {
            this.name = name;
            this.requests[name] = this;
            Module["addRunDependency"](`fp ${this.name}`);
          },
          send: function () {},
          onload: function () {
            var byteArray = this.byteArray.subarray(this.start, this.end);
            this.finish(byteArray);
          },
          finish: function (byteArray) {
            var that = this;
            Module["FS_createDataFile"](
              this.name,
              null,
              byteArray,
              true,
              true,
              true
            );
            Module["removeRunDependency"](`fp ${that.name}`);
            this.requests[this.name] = null;
          },
        };
        var files = metadata["files"];
        for (var i = 0; i < files.length; ++i) {
          new DataRequest(
            files[i]["start"],
            files[i]["end"],
            files[i]["audio"] || 0
          ).open("GET", files[i]["filename"]);
        }
        function processPackageData(arrayBuffer) {
          assert(arrayBuffer, "Loading data file failed.");
          assert(
            arrayBuffer.constructor.name === ArrayBuffer.name,
            "bad input to processPackageData"
          );
          var byteArray = new Uint8Array(arrayBuffer);
          DataRequest.prototype.byteArray = byteArray;
          var files = metadata["files"];
          for (var i = 0; i < files.length; ++i) {
            DataRequest.prototype.requests[files[i].filename].onload();
          }
          Module["removeRunDependency"](
            "datafile_../bin/sherpa-onnx-wasm-main.data"
          );
        }
        Module["addRunDependency"](
          "datafile_../bin/sherpa-onnx-wasm-main.data"
        );
        if (!Module.preloadResults) Module.preloadResults = {};
        Module.preloadResults[PACKAGE_NAME] = { fromCache: false };
        if (fetched) {
          processPackageData(fetched);
          fetched = null;
        } else {
          fetchedCallback = processPackageData;
        }
      }
      if (Module["calledRun"]) {
        runWithFS();
      } else {
        if (!Module["preRun"]) Module["preRun"] = [];
        Module["preRun"].push(runWithFS);
      }
    };
    loadPackage({
      files: [
        { filename: "/.gitignore", start: 0, end: 29 },
        { filename: "/README.md", start: 29, end: 892 },
        { filename: "/espeak-ng-data/af_dict", start: 892, end: 122365 },
        { filename: "/espeak-ng-data/am_dict", start: 122365, end: 186243 },
        { filename: "/espeak-ng-data/an_dict", start: 186243, end: 192934 },
        { filename: "/espeak-ng-data/ar_dict", start: 192934, end: 671099 },
        { filename: "/espeak-ng-data/as_dict", start: 671099, end: 676104 },
        { filename: "/espeak-ng-data/az_dict", start: 676104, end: 719877 },
        { filename: "/espeak-ng-data/ba_dict", start: 719877, end: 721975 },
        { filename: "/espeak-ng-data/be_dict", start: 721975, end: 724627 },
        { filename: "/espeak-ng-data/bg_dict", start: 724627, end: 811678 },
        { filename: "/espeak-ng-data/bn_dict", start: 811678, end: 901657 },
        { filename: "/espeak-ng-data/bpy_dict", start: 901657, end: 906883 },
        { filename: "/espeak-ng-data/bs_dict", start: 906883, end: 953951 },
        { filename: "/espeak-ng-data/ca_dict", start: 953951, end: 999517 },
        { filename: "/espeak-ng-data/chr_dict", start: 999517, end: 1002376 },
        { filename: "/espeak-ng-data/cmn_dict", start: 1002376, end: 2568711 },
        { filename: "/espeak-ng-data/cs_dict", start: 2568711, end: 2618356 },
        { filename: "/espeak-ng-data/cv_dict", start: 2618356, end: 2619700 },
        { filename: "/espeak-ng-data/cy_dict", start: 2619700, end: 2662830 },
        { filename: "/espeak-ng-data/da_dict", start: 2662830, end: 2908117 },
        { filename: "/espeak-ng-data/de_dict", start: 2908117, end: 2976393 },
        { filename: "/espeak-ng-data/el_dict", start: 2976393, end: 3049234 },
        { filename: "/espeak-ng-data/en_dict", start: 3049234, end: 3216178 },
        { filename: "/espeak-ng-data/eo_dict", start: 3216178, end: 3220844 },
        { filename: "/espeak-ng-data/es_dict", start: 3220844, end: 3270096 },
        { filename: "/espeak-ng-data/et_dict", start: 3270096, end: 3314359 },
        { filename: "/espeak-ng-data/eu_dict", start: 3314359, end: 3363200 },
        { filename: "/espeak-ng-data/fa_dict", start: 3363200, end: 3655623 },
        { filename: "/espeak-ng-data/fi_dict", start: 3655623, end: 3699551 },
        { filename: "/espeak-ng-data/fr_dict", start: 3699551, end: 3763278 },
        { filename: "/espeak-ng-data/ga_dict", start: 3763278, end: 3815951 },
        { filename: "/espeak-ng-data/gd_dict", start: 3815951, end: 3865072 },
        { filename: "/espeak-ng-data/gn_dict", start: 3865072, end: 3868320 },
        { filename: "/espeak-ng-data/grc_dict", start: 3868320, end: 3871753 },
        { filename: "/espeak-ng-data/gu_dict", start: 3871753, end: 3954233 },
        { filename: "/espeak-ng-data/hak_dict", start: 3954233, end: 3957568 },
        { filename: "/espeak-ng-data/haw_dict", start: 3957568, end: 3960011 },
        { filename: "/espeak-ng-data/he_dict", start: 3960011, end: 3966974 },
        { filename: "/espeak-ng-data/hi_dict", start: 3966974, end: 4059117 },
        { filename: "/espeak-ng-data/hr_dict", start: 4059117, end: 4108505 },
        { filename: "/espeak-ng-data/ht_dict", start: 4108505, end: 4110308 },
        { filename: "/espeak-ng-data/hu_dict", start: 4110308, end: 4264093 },
        { filename: "/espeak-ng-data/hy_dict", start: 4264093, end: 4326356 },
        { filename: "/espeak-ng-data/ia_dict", start: 4326356, end: 4657631 },
        { filename: "/espeak-ng-data/id_dict", start: 4657631, end: 4701089 },
        {
          filename: "/espeak-ng-data/intonations",
          start: 4701089,
          end: 4703129,
        },
        { filename: "/espeak-ng-data/io_dict", start: 4703129, end: 4705294 },
        { filename: "/espeak-ng-data/is_dict", start: 4705294, end: 4749648 },
        { filename: "/espeak-ng-data/it_dict", start: 4749648, end: 4902537 },
        { filename: "/espeak-ng-data/ja_dict", start: 4902537, end: 4950189 },
        { filename: "/espeak-ng-data/jbo_dict", start: 4950189, end: 4952432 },
        { filename: "/espeak-ng-data/ka_dict", start: 4952432, end: 5040207 },
        { filename: "/espeak-ng-data/kk_dict", start: 5040207, end: 5042066 },
        { filename: "/espeak-ng-data/kl_dict", start: 5042066, end: 5044904 },
        { filename: "/espeak-ng-data/kn_dict", start: 5044904, end: 5132732 },
        { filename: "/espeak-ng-data/ko_dict", start: 5132732, end: 5180255 },
        { filename: "/espeak-ng-data/kok_dict", start: 5180255, end: 5186649 },
        { filename: "/espeak-ng-data/ku_dict", start: 5186649, end: 5188914 },
        { filename: "/espeak-ng-data/ky_dict", start: 5188914, end: 5253891 },
        { filename: "/espeak-ng-data/la_dict", start: 5253891, end: 5257697 },
        {
          filename: "/espeak-ng-data/lang/aav/vi",
          start: 5257697,
          end: 5257808,
        },
        {
          filename: "/espeak-ng-data/lang/aav/vi-VN-x-central",
          start: 5257808,
          end: 5257951,
        },
        {
          filename: "/espeak-ng-data/lang/aav/vi-VN-x-south",
          start: 5257951,
          end: 5258093,
        },
        {
          filename: "/espeak-ng-data/lang/art/eo",
          start: 5258093,
          end: 5258134,
        },
        {
          filename: "/espeak-ng-data/lang/art/ia",
          start: 5258134,
          end: 5258163,
        },
        {
          filename: "/espeak-ng-data/lang/art/io",
          start: 5258163,
          end: 5258213,
        },
        {
          filename: "/espeak-ng-data/lang/art/jbo",
          start: 5258213,
          end: 5258282,
        },
        {
          filename: "/espeak-ng-data/lang/art/lfn",
          start: 5258282,
          end: 5258417,
        },
        {
          filename: "/espeak-ng-data/lang/art/piqd",
          start: 5258417,
          end: 5258473,
        },
        {
          filename: "/espeak-ng-data/lang/art/py",
          start: 5258473,
          end: 5258613,
        },
        {
          filename: "/espeak-ng-data/lang/art/qdb",
          start: 5258613,
          end: 5258670,
        },
        {
          filename: "/espeak-ng-data/lang/art/qya",
          start: 5258670,
          end: 5258843,
        },
        {
          filename: "/espeak-ng-data/lang/art/sjn",
          start: 5258843,
          end: 5259018,
        },
        {
          filename: "/espeak-ng-data/lang/azc/nci",
          start: 5259018,
          end: 5259132,
        },
        {
          filename: "/espeak-ng-data/lang/bat/lt",
          start: 5259132,
          end: 5259160,
        },
        {
          filename: "/espeak-ng-data/lang/bat/ltg",
          start: 5259160,
          end: 5259472,
        },
        {
          filename: "/espeak-ng-data/lang/bat/lv",
          start: 5259472,
          end: 5259701,
        },
        {
          filename: "/espeak-ng-data/lang/bnt/sw",
          start: 5259701,
          end: 5259742,
        },
        {
          filename: "/espeak-ng-data/lang/bnt/tn",
          start: 5259742,
          end: 5259784,
        },
        {
          filename: "/espeak-ng-data/lang/ccs/ka",
          start: 5259784,
          end: 5259908,
        },
        {
          filename: "/espeak-ng-data/lang/cel/cy",
          start: 5259908,
          end: 5259945,
        },
        {
          filename: "/espeak-ng-data/lang/cel/ga",
          start: 5259945,
          end: 5260011,
        },
        {
          filename: "/espeak-ng-data/lang/cel/gd",
          start: 5260011,
          end: 5260062,
        },
        {
          filename: "/espeak-ng-data/lang/cus/om",
          start: 5260062,
          end: 5260101,
        },
        {
          filename: "/espeak-ng-data/lang/dra/kn",
          start: 5260101,
          end: 5260156,
        },
        {
          filename: "/espeak-ng-data/lang/dra/ml",
          start: 5260156,
          end: 5260213,
        },
        {
          filename: "/espeak-ng-data/lang/dra/ta",
          start: 5260213,
          end: 5260264,
        },
        {
          filename: "/espeak-ng-data/lang/dra/te",
          start: 5260264,
          end: 5260334,
        },
        {
          filename: "/espeak-ng-data/lang/esx/kl",
          start: 5260334,
          end: 5260364,
        },
        { filename: "/espeak-ng-data/lang/eu", start: 5260364, end: 5260418 },
        {
          filename: "/espeak-ng-data/lang/gmq/da",
          start: 5260418,
          end: 5260461,
        },
        {
          filename: "/espeak-ng-data/lang/gmq/is",
          start: 5260461,
          end: 5260488,
        },
        {
          filename: "/espeak-ng-data/lang/gmq/nb",
          start: 5260488,
          end: 5260575,
        },
        {
          filename: "/espeak-ng-data/lang/gmq/sv",
          start: 5260575,
          end: 5260600,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/af",
          start: 5260600,
          end: 5260723,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/de",
          start: 5260723,
          end: 5260765,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en",
          start: 5260765,
          end: 5260905,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-029",
          start: 5260905,
          end: 5261240,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-GB-scotland",
          start: 5261240,
          end: 5261535,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbclan",
          start: 5261535,
          end: 5261773,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbcwmd",
          start: 5261773,
          end: 5261961,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-GB-x-rp",
          start: 5261961,
          end: 5262210,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-US",
          start: 5262210,
          end: 5262467,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/en-US-nyc",
          start: 5262467,
          end: 5262738,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/lb",
          start: 5262738,
          end: 5262769,
        },
        {
          filename: "/espeak-ng-data/lang/gmw/nl",
          start: 5262769,
          end: 5262792,
        },
        {
          filename: "/espeak-ng-data/lang/grk/el",
          start: 5262792,
          end: 5262815,
        },
        {
          filename: "/espeak-ng-data/lang/grk/grc",
          start: 5262815,
          end: 5262914,
        },
        {
          filename: "/espeak-ng-data/lang/inc/as",
          start: 5262914,
          end: 5262956,
        },
        {
          filename: "/espeak-ng-data/lang/inc/bn",
          start: 5262956,
          end: 5262981,
        },
        {
          filename: "/espeak-ng-data/lang/inc/bpy",
          start: 5262981,
          end: 5263020,
        },
        {
          filename: "/espeak-ng-data/lang/inc/gu",
          start: 5263020,
          end: 5263062,
        },
        {
          filename: "/espeak-ng-data/lang/inc/hi",
          start: 5263062,
          end: 5263085,
        },
        {
          filename: "/espeak-ng-data/lang/inc/kok",
          start: 5263085,
          end: 5263111,
        },
        {
          filename: "/espeak-ng-data/lang/inc/mr",
          start: 5263111,
          end: 5263152,
        },
        {
          filename: "/espeak-ng-data/lang/inc/ne",
          start: 5263152,
          end: 5263189,
        },
        {
          filename: "/espeak-ng-data/lang/inc/or",
          start: 5263189,
          end: 5263228,
        },
        {
          filename: "/espeak-ng-data/lang/inc/pa",
          start: 5263228,
          end: 5263253,
        },
        {
          filename: "/espeak-ng-data/lang/inc/sd",
          start: 5263253,
          end: 5263319,
        },
        {
          filename: "/espeak-ng-data/lang/inc/si",
          start: 5263319,
          end: 5263374,
        },
        {
          filename: "/espeak-ng-data/lang/inc/ur",
          start: 5263374,
          end: 5263468,
        },
        {
          filename: "/espeak-ng-data/lang/ine/hy",
          start: 5263468,
          end: 5263529,
        },
        {
          filename: "/espeak-ng-data/lang/ine/hyw",
          start: 5263529,
          end: 5263894,
        },
        {
          filename: "/espeak-ng-data/lang/ine/sq",
          start: 5263894,
          end: 5263997,
        },
        {
          filename: "/espeak-ng-data/lang/ira/fa",
          start: 5263997,
          end: 5264087,
        },
        {
          filename: "/espeak-ng-data/lang/ira/fa-Latn",
          start: 5264087,
          end: 5264356,
        },
        {
          filename: "/espeak-ng-data/lang/ira/ku",
          start: 5264356,
          end: 5264396,
        },
        {
          filename: "/espeak-ng-data/lang/iro/chr",
          start: 5264396,
          end: 5264965,
        },
        {
          filename: "/espeak-ng-data/lang/itc/la",
          start: 5264965,
          end: 5265262,
        },
        {
          filename: "/espeak-ng-data/lang/jpx/ja",
          start: 5265262,
          end: 5265314,
        },
        { filename: "/espeak-ng-data/lang/ko", start: 5265314, end: 5265365 },
        {
          filename: "/espeak-ng-data/lang/map/haw",
          start: 5265365,
          end: 5265407,
        },
        {
          filename: "/espeak-ng-data/lang/miz/mto",
          start: 5265407,
          end: 5265590,
        },
        {
          filename: "/espeak-ng-data/lang/myn/quc",
          start: 5265590,
          end: 5265800,
        },
        {
          filename: "/espeak-ng-data/lang/poz/id",
          start: 5265800,
          end: 5265934,
        },
        {
          filename: "/espeak-ng-data/lang/poz/mi",
          start: 5265934,
          end: 5266301,
        },
        {
          filename: "/espeak-ng-data/lang/poz/ms",
          start: 5266301,
          end: 5266731,
        },
        { filename: "/espeak-ng-data/lang/qu", start: 5266731, end: 5266819 },
        {
          filename: "/espeak-ng-data/lang/roa/an",
          start: 5266819,
          end: 5266846,
        },
        {
          filename: "/espeak-ng-data/lang/roa/ca",
          start: 5266846,
          end: 5266871,
        },
        {
          filename: "/espeak-ng-data/lang/roa/es",
          start: 5266871,
          end: 5266934,
        },
        {
          filename: "/espeak-ng-data/lang/roa/es-419",
          start: 5266934,
          end: 5267101,
        },
        {
          filename: "/espeak-ng-data/lang/roa/fr",
          start: 5267101,
          end: 5267180,
        },
        {
          filename: "/espeak-ng-data/lang/roa/fr-BE",
          start: 5267180,
          end: 5267264,
        },
        {
          filename: "/espeak-ng-data/lang/roa/fr-CH",
          start: 5267264,
          end: 5267350,
        },
        {
          filename: "/espeak-ng-data/lang/roa/ht",
          start: 5267350,
          end: 5267490,
        },
        {
          filename: "/espeak-ng-data/lang/roa/it",
          start: 5267490,
          end: 5267599,
        },
        {
          filename: "/espeak-ng-data/lang/roa/pap",
          start: 5267599,
          end: 5267661,
        },
        {
          filename: "/espeak-ng-data/lang/roa/pt",
          start: 5267661,
          end: 5267756,
        },
        {
          filename: "/espeak-ng-data/lang/roa/pt-BR",
          start: 5267756,
          end: 5267865,
        },
        {
          filename: "/espeak-ng-data/lang/roa/ro",
          start: 5267865,
          end: 5267891,
        },
        {
          filename: "/espeak-ng-data/lang/sai/gn",
          start: 5267891,
          end: 5267938,
        },
        {
          filename: "/espeak-ng-data/lang/sem/am",
          start: 5267938,
          end: 5267979,
        },
        {
          filename: "/espeak-ng-data/lang/sem/ar",
          start: 5267979,
          end: 5268029,
        },
        {
          filename: "/espeak-ng-data/lang/sem/he",
          start: 5268029,
          end: 5268069,
        },
        {
          filename: "/espeak-ng-data/lang/sem/mt",
          start: 5268069,
          end: 5268110,
        },
        {
          filename: "/espeak-ng-data/lang/sit/cmn",
          start: 5268110,
          end: 5268796,
        },
        {
          filename: "/espeak-ng-data/lang/sit/cmn-Latn-pinyin",
          start: 5268796,
          end: 5268957,
        },
        {
          filename: "/espeak-ng-data/lang/sit/hak",
          start: 5268957,
          end: 5269085,
        },
        {
          filename: "/espeak-ng-data/lang/sit/my",
          start: 5269085,
          end: 5269141,
        },
        {
          filename: "/espeak-ng-data/lang/sit/yue",
          start: 5269141,
          end: 5269335,
        },
        {
          filename: "/espeak-ng-data/lang/sit/yue-Latn-jyutping",
          start: 5269335,
          end: 5269548,
        },
        {
          filename: "/espeak-ng-data/lang/tai/shn",
          start: 5269548,
          end: 5269640,
        },
        {
          filename: "/espeak-ng-data/lang/tai/th",
          start: 5269640,
          end: 5269677,
        },
        {
          filename: "/espeak-ng-data/lang/trk/az",
          start: 5269677,
          end: 5269722,
        },
        {
          filename: "/espeak-ng-data/lang/trk/ba",
          start: 5269722,
          end: 5269747,
        },
        {
          filename: "/espeak-ng-data/lang/trk/cv",
          start: 5269747,
          end: 5269787,
        },
        {
          filename: "/espeak-ng-data/lang/trk/kk",
          start: 5269787,
          end: 5269827,
        },
        {
          filename: "/espeak-ng-data/lang/trk/ky",
          start: 5269827,
          end: 5269870,
        },
        {
          filename: "/espeak-ng-data/lang/trk/nog",
          start: 5269870,
          end: 5269909,
        },
        {
          filename: "/espeak-ng-data/lang/trk/tk",
          start: 5269909,
          end: 5269934,
        },
        {
          filename: "/espeak-ng-data/lang/trk/tr",
          start: 5269934,
          end: 5269959,
        },
        {
          filename: "/espeak-ng-data/lang/trk/tt",
          start: 5269959,
          end: 5269982,
        },
        {
          filename: "/espeak-ng-data/lang/trk/ug",
          start: 5269982,
          end: 5270006,
        },
        {
          filename: "/espeak-ng-data/lang/trk/uz",
          start: 5270006,
          end: 5270045,
        },
        {
          filename: "/espeak-ng-data/lang/urj/et",
          start: 5270045,
          end: 5270282,
        },
        {
          filename: "/espeak-ng-data/lang/urj/fi",
          start: 5270282,
          end: 5270519,
        },
        {
          filename: "/espeak-ng-data/lang/urj/hu",
          start: 5270519,
          end: 5270592,
        },
        {
          filename: "/espeak-ng-data/lang/urj/smj",
          start: 5270592,
          end: 5270637,
        },
        {
          filename: "/espeak-ng-data/lang/zle/be",
          start: 5270637,
          end: 5270689,
        },
        {
          filename: "/espeak-ng-data/lang/zle/ru",
          start: 5270689,
          end: 5270746,
        },
        {
          filename: "/espeak-ng-data/lang/zle/ru-LV",
          start: 5270746,
          end: 5271026,
        },
        {
          filename: "/espeak-ng-data/lang/zle/ru-cl",
          start: 5271026,
          end: 5271117,
        },
        {
          filename: "/espeak-ng-data/lang/zle/uk",
          start: 5271117,
          end: 5271214,
        },
        {
          filename: "/espeak-ng-data/lang/zls/bg",
          start: 5271214,
          end: 5271325,
        },
        {
          filename: "/espeak-ng-data/lang/zls/bs",
          start: 5271325,
          end: 5271555,
        },
        {
          filename: "/espeak-ng-data/lang/zls/hr",
          start: 5271555,
          end: 5271817,
        },
        {
          filename: "/espeak-ng-data/lang/zls/mk",
          start: 5271817,
          end: 5271845,
        },
        {
          filename: "/espeak-ng-data/lang/zls/sl",
          start: 5271845,
          end: 5271888,
        },
        {
          filename: "/espeak-ng-data/lang/zls/sr",
          start: 5271888,
          end: 5272138,
        },
        {
          filename: "/espeak-ng-data/lang/zlw/cs",
          start: 5272138,
          end: 5272161,
        },
        {
          filename: "/espeak-ng-data/lang/zlw/pl",
          start: 5272161,
          end: 5272199,
        },
        {
          filename: "/espeak-ng-data/lang/zlw/sk",
          start: 5272199,
          end: 5272223,
        },
        { filename: "/espeak-ng-data/lb_dict", start: 5272223, end: 5960154 },
        { filename: "/espeak-ng-data/lfn_dict", start: 5960154, end: 5962947 },
        { filename: "/espeak-ng-data/lt_dict", start: 5962947, end: 6012837 },
        { filename: "/espeak-ng-data/lv_dict", start: 6012837, end: 6079174 },
        { filename: "/espeak-ng-data/mi_dict", start: 6079174, end: 6080520 },
        { filename: "/espeak-ng-data/mk_dict", start: 6080520, end: 6144379 },
        { filename: "/espeak-ng-data/ml_dict", start: 6144379, end: 6236724 },
        { filename: "/espeak-ng-data/mr_dict", start: 6236724, end: 6324115 },
        { filename: "/espeak-ng-data/ms_dict", start: 6324115, end: 6377656 },
        { filename: "/espeak-ng-data/mt_dict", start: 6377656, end: 6382040 },
        { filename: "/espeak-ng-data/mto_dict", start: 6382040, end: 6386e3 },
        { filename: "/espeak-ng-data/my_dict", start: 6386e3, end: 6481948 },
        { filename: "/espeak-ng-data/nci_dict", start: 6481948, end: 6483482 },
        { filename: "/espeak-ng-data/ne_dict", start: 6483482, end: 6578859 },
        { filename: "/espeak-ng-data/nl_dict", start: 6578859, end: 6644838 },
        { filename: "/espeak-ng-data/no_dict", start: 6644838, end: 6649016 },
        { filename: "/espeak-ng-data/nog_dict", start: 6649016, end: 6652310 },
        { filename: "/espeak-ng-data/om_dict", start: 6652310, end: 6654612 },
        { filename: "/espeak-ng-data/or_dict", start: 6654612, end: 6743858 },
        { filename: "/espeak-ng-data/pa_dict", start: 6743858, end: 6823811 },
        { filename: "/espeak-ng-data/pap_dict", start: 6823811, end: 6825939 },
        { filename: "/espeak-ng-data/phondata", start: 6825939, end: 7376363 },
        {
          filename: "/espeak-ng-data/phondata-manifest",
          start: 7376363,
          end: 7398184,
        },
        { filename: "/espeak-ng-data/phonindex", start: 7398184, end: 7437258 },
        { filename: "/espeak-ng-data/phontab", start: 7437258, end: 7493054 },
        { filename: "/espeak-ng-data/piqd_dict", start: 7493054, end: 7494764 },
        { filename: "/espeak-ng-data/pl_dict", start: 7494764, end: 7571494 },
        { filename: "/espeak-ng-data/pt_dict", start: 7571494, end: 7639311 },
        { filename: "/espeak-ng-data/py_dict", start: 7639311, end: 7641720 },
        { filename: "/espeak-ng-data/qdb_dict", start: 7641720, end: 7644748 },
        { filename: "/espeak-ng-data/qu_dict", start: 7644748, end: 7646667 },
        { filename: "/espeak-ng-data/quc_dict", start: 7646667, end: 7648117 },
        { filename: "/espeak-ng-data/qya_dict", start: 7648117, end: 7650056 },
        { filename: "/espeak-ng-data/ro_dict", start: 7650056, end: 7718594 },
        { filename: "/espeak-ng-data/ru_dict", start: 7718594, end: 16250986 },
        { filename: "/espeak-ng-data/sd_dict", start: 16250986, end: 16310914 },
        {
          filename: "/espeak-ng-data/shn_dict",
          start: 16310914,
          end: 16399086,
        },
        { filename: "/espeak-ng-data/si_dict", start: 16399086, end: 16484470 },
        {
          filename: "/espeak-ng-data/sjn_dict",
          start: 16484470,
          end: 16486253,
        },
        { filename: "/espeak-ng-data/sk_dict", start: 16486253, end: 16536255 },
        { filename: "/espeak-ng-data/sl_dict", start: 16536255, end: 16581302 },
        {
          filename: "/espeak-ng-data/smj_dict",
          start: 16581302,
          end: 16616397,
        },
        { filename: "/espeak-ng-data/sq_dict", start: 16616397, end: 16661400 },
        { filename: "/espeak-ng-data/sr_dict", start: 16661400, end: 16708232 },
        { filename: "/espeak-ng-data/sv_dict", start: 16708232, end: 16756068 },
        { filename: "/espeak-ng-data/sw_dict", start: 16756068, end: 16803872 },
        { filename: "/espeak-ng-data/ta_dict", start: 16803872, end: 17013425 },
        { filename: "/espeak-ng-data/te_dict", start: 17013425, end: 17108262 },
        { filename: "/espeak-ng-data/th_dict", start: 17108262, end: 17110563 },
        { filename: "/espeak-ng-data/tk_dict", start: 17110563, end: 17131431 },
        { filename: "/espeak-ng-data/tn_dict", start: 17131431, end: 17134503 },
        { filename: "/espeak-ng-data/tr_dict", start: 17134503, end: 17181296 },
        { filename: "/espeak-ng-data/tt_dict", start: 17181296, end: 17183417 },
        { filename: "/espeak-ng-data/ug_dict", start: 17183417, end: 17185487 },
        { filename: "/espeak-ng-data/uk_dict", start: 17185487, end: 17188979 },
        { filename: "/espeak-ng-data/ur_dict", start: 17188979, end: 17322535 },
        { filename: "/espeak-ng-data/uz_dict", start: 17322535, end: 17325075 },
        { filename: "/espeak-ng-data/vi_dict", start: 17325075, end: 17377683 },
        {
          filename: "/espeak-ng-data/voices/!v/Alex",
          start: 17377683,
          end: 17377811,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Alicia",
          start: 17377811,
          end: 17378285,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Andrea",
          start: 17378285,
          end: 17378642,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Andy",
          start: 17378642,
          end: 17378962,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Annie",
          start: 17378962,
          end: 17379277,
        },
        {
          filename: "/espeak-ng-data/voices/!v/AnxiousAndy",
          start: 17379277,
          end: 17379638,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Demonic",
          start: 17379638,
          end: 17383496,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Denis",
          start: 17383496,
          end: 17383801,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Diogo",
          start: 17383801,
          end: 17384180,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Gene",
          start: 17384180,
          end: 17384461,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Gene2",
          start: 17384461,
          end: 17384744,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Henrique",
          start: 17384744,
          end: 17385125,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Hugo",
          start: 17385125,
          end: 17385503,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Jacky",
          start: 17385503,
          end: 17385770,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Lee",
          start: 17385770,
          end: 17386108,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Marco",
          start: 17386108,
          end: 17386575,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Mario",
          start: 17386575,
          end: 17386845,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Michael",
          start: 17386845,
          end: 17387115,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Mike",
          start: 17387115,
          end: 17387227,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Mr serious",
          start: 17387227,
          end: 17390420,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Nguyen",
          start: 17390420,
          end: 17390700,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Reed",
          start: 17390700,
          end: 17390902,
        },
        {
          filename: "/espeak-ng-data/voices/!v/RicishayMax",
          start: 17390902,
          end: 17391135,
        },
        {
          filename: "/espeak-ng-data/voices/!v/RicishayMax2",
          start: 17391135,
          end: 17391570,
        },
        {
          filename: "/espeak-ng-data/voices/!v/RicishayMax3",
          start: 17391570,
          end: 17392005,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Storm",
          start: 17392005,
          end: 17392425,
        },
        {
          filename: "/espeak-ng-data/voices/!v/Tweaky",
          start: 17392425,
          end: 17395614,
        },
        {
          filename: "/espeak-ng-data/voices/!v/UniRobot",
          start: 17395614,
          end: 17396031,
        },
        {
          filename: "/espeak-ng-data/voices/!v/adam",
          start: 17396031,
          end: 17396106,
        },
        {
          filename: "/espeak-ng-data/voices/!v/anika",
          start: 17396106,
          end: 17396599,
        },
        {
          filename: "/espeak-ng-data/voices/!v/anikaRobot",
          start: 17396599,
          end: 17397111,
        },
        {
          filename: "/espeak-ng-data/voices/!v/announcer",
          start: 17397111,
          end: 17397411,
        },
        {
          filename: "/espeak-ng-data/voices/!v/antonio",
          start: 17397411,
          end: 17397792,
        },
        {
          filename: "/espeak-ng-data/voices/!v/aunty",
          start: 17397792,
          end: 17398150,
        },
        {
          filename: "/espeak-ng-data/voices/!v/belinda",
          start: 17398150,
          end: 17398490,
        },
        {
          filename: "/espeak-ng-data/voices/!v/benjamin",
          start: 17398490,
          end: 17398691,
        },
        {
          filename: "/espeak-ng-data/voices/!v/boris",
          start: 17398691,
          end: 17398915,
        },
        {
          filename: "/espeak-ng-data/voices/!v/caleb",
          start: 17398915,
          end: 17398972,
        },
        {
          filename: "/espeak-ng-data/voices/!v/croak",
          start: 17398972,
          end: 17399065,
        },
        {
          filename: "/espeak-ng-data/voices/!v/david",
          start: 17399065,
          end: 17399177,
        },
        {
          filename: "/espeak-ng-data/voices/!v/ed",
          start: 17399177,
          end: 17399464,
        },
        {
          filename: "/espeak-ng-data/voices/!v/edward",
          start: 17399464,
          end: 17399615,
        },
        {
          filename: "/espeak-ng-data/voices/!v/edward2",
          start: 17399615,
          end: 17399767,
        },
        {
          filename: "/espeak-ng-data/voices/!v/f1",
          start: 17399767,
          end: 17400091,
        },
        {
          filename: "/espeak-ng-data/voices/!v/f2",
          start: 17400091,
          end: 17400448,
        },
        {
          filename: "/espeak-ng-data/voices/!v/f3",
          start: 17400448,
          end: 17400823,
        },
        {
          filename: "/espeak-ng-data/voices/!v/f4",
          start: 17400823,
          end: 17401173,
        },
        {
          filename: "/espeak-ng-data/voices/!v/f5",
          start: 17401173,
          end: 17401605,
        },
        {
          filename: "/espeak-ng-data/voices/!v/fast",
          start: 17401605,
          end: 17401754,
        },
        {
          filename: "/espeak-ng-data/voices/!v/grandma",
          start: 17401754,
          end: 17402017,
        },
        {
          filename: "/espeak-ng-data/voices/!v/grandpa",
          start: 17402017,
          end: 17402273,
        },
        {
          filename: "/espeak-ng-data/voices/!v/gustave",
          start: 17402273,
          end: 17402526,
        },
        {
          filename: "/espeak-ng-data/voices/!v/ian",
          start: 17402526,
          end: 17405694,
        },
        {
          filename: "/espeak-ng-data/voices/!v/iven",
          start: 17405694,
          end: 17405955,
        },
        {
          filename: "/espeak-ng-data/voices/!v/iven2",
          start: 17405955,
          end: 17406234,
        },
        {
          filename: "/espeak-ng-data/voices/!v/iven3",
          start: 17406234,
          end: 17406496,
        },
        {
          filename: "/espeak-ng-data/voices/!v/iven4",
          start: 17406496,
          end: 17406757,
        },
        {
          filename: "/espeak-ng-data/voices/!v/john",
          start: 17406757,
          end: 17409943,
        },
        {
          filename: "/espeak-ng-data/voices/!v/kaukovalta",
          start: 17409943,
          end: 17410304,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt",
          start: 17410304,
          end: 17410342,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt2",
          start: 17410342,
          end: 17410380,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt3",
          start: 17410380,
          end: 17410419,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt4",
          start: 17410419,
          end: 17410458,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt5",
          start: 17410458,
          end: 17410497,
        },
        {
          filename: "/espeak-ng-data/voices/!v/klatt6",
          start: 17410497,
          end: 17410536,
        },
        {
          filename: "/espeak-ng-data/voices/!v/linda",
          start: 17410536,
          end: 17410886,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m1",
          start: 17410886,
          end: 17411221,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m2",
          start: 17411221,
          end: 17411485,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m3",
          start: 17411485,
          end: 17411785,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m4",
          start: 17411785,
          end: 17412075,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m5",
          start: 17412075,
          end: 17412337,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m6",
          start: 17412337,
          end: 17412525,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m7",
          start: 17412525,
          end: 17412779,
        },
        {
          filename: "/espeak-ng-data/voices/!v/m8",
          start: 17412779,
          end: 17413063,
        },
        {
          filename: "/espeak-ng-data/voices/!v/marcelo",
          start: 17413063,
          end: 17413314,
        },
        {
          filename: "/espeak-ng-data/voices/!v/max",
          start: 17413314,
          end: 17413539,
        },
        {
          filename: "/espeak-ng-data/voices/!v/michel",
          start: 17413539,
          end: 17413943,
        },
        {
          filename: "/espeak-ng-data/voices/!v/miguel",
          start: 17413943,
          end: 17414325,
        },
        {
          filename: "/espeak-ng-data/voices/!v/mike2",
          start: 17414325,
          end: 17414513,
        },
        {
          filename: "/espeak-ng-data/voices/!v/norbert",
          start: 17414513,
          end: 17417702,
        },
        {
          filename: "/espeak-ng-data/voices/!v/pablo",
          start: 17417702,
          end: 17420844,
        },
        {
          filename: "/espeak-ng-data/voices/!v/paul",
          start: 17420844,
          end: 17421128,
        },
        {
          filename: "/espeak-ng-data/voices/!v/pedro",
          start: 17421128,
          end: 17421480,
        },
        {
          filename: "/espeak-ng-data/voices/!v/quincy",
          start: 17421480,
          end: 17421834,
        },
        {
          filename: "/espeak-ng-data/voices/!v/rob",
          start: 17421834,
          end: 17422099,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robert",
          start: 17422099,
          end: 17422373,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft",
          start: 17422373,
          end: 17422824,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft2",
          start: 17422824,
          end: 17423278,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft3",
          start: 17423278,
          end: 17423733,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft4",
          start: 17423733,
          end: 17424180,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft5",
          start: 17424180,
          end: 17424625,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft6",
          start: 17424625,
          end: 17424912,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft7",
          start: 17424912,
          end: 17425322,
        },
        {
          filename: "/espeak-ng-data/voices/!v/robosoft8",
          start: 17425322,
          end: 17425565,
        },
        {
          filename: "/espeak-ng-data/voices/!v/sandro",
          start: 17425565,
          end: 17426095,
        },
        {
          filename: "/espeak-ng-data/voices/!v/shelby",
          start: 17426095,
          end: 17426375,
        },
        {
          filename: "/espeak-ng-data/voices/!v/steph",
          start: 17426375,
          end: 17426739,
        },
        {
          filename: "/espeak-ng-data/voices/!v/steph2",
          start: 17426739,
          end: 17427106,
        },
        {
          filename: "/espeak-ng-data/voices/!v/steph3",
          start: 17427106,
          end: 17427483,
        },
        {
          filename: "/espeak-ng-data/voices/!v/travis",
          start: 17427483,
          end: 17427866,
        },
        {
          filename: "/espeak-ng-data/voices/!v/victor",
          start: 17427866,
          end: 17428119,
        },
        {
          filename: "/espeak-ng-data/voices/!v/whisper",
          start: 17428119,
          end: 17428305,
        },
        {
          filename: "/espeak-ng-data/voices/!v/whisperf",
          start: 17428305,
          end: 17428697,
        },
        {
          filename: "/espeak-ng-data/voices/!v/zac",
          start: 17428697,
          end: 17428972,
        },
        {
          filename: "/espeak-ng-data/yue_dict",
          start: 17428972,
          end: 17992543,
        },
        { filename: "/model.onnx", start: 17992543, end: 96573590 },
        { filename: "/tokens.txt", start: 96573590, end: 96574544 },
      ],
      remote_package_size: 96574544,
    });
  })(data);
  var moduleOverrides = Object.assign({}, Module);
  var arguments_ = [];
  var thisProgram = "./this.program";
  var quit_ = (status, toThrow) => {
    throw toThrow;
  };
  var ENVIRONMENT_IS_WEB = typeof window == "object";
  var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
  var ENVIRONMENT_IS_NODE =
    typeof process == "object" &&
    typeof process.versions == "object" &&
    typeof process.versions.node == "string";
  var scriptDirectory = "";
  function locateFile(path) {
    if (Module["locateFile"]) {
      return Module["locateFile"](path, scriptDirectory);
    }
    return scriptDirectory + path;
  }
  var read_, readAsync, readBinary;
  if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
    if (ENVIRONMENT_IS_WORKER) {
      scriptDirectory = self.location.href;
    } else if (typeof document != "undefined" && document.currentScript) {
      scriptDirectory = document.currentScript.src;
    }
    if (scriptDirectory.startsWith("blob:")) {
      scriptDirectory = "";
    } else {
      scriptDirectory = scriptDirectory.substr(
        0,
        scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
      );
    }
    {
      read_ = (url) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, false);
        xhr.send(null);
        return xhr.responseText;
      };
      if (ENVIRONMENT_IS_WORKER) {
        readBinary = (url) => {
          var xhr = new XMLHttpRequest();
          xhr.open("GET", url, false);
          xhr.responseType = "arraybuffer";
          xhr.send(null);
          return new Uint8Array(xhr.response);
        };
      }
      readAsync = (url, onload, onerror) => {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.responseType = "arraybuffer";
        xhr.onload = () => {
          if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) {
            onload(xhr.response);
            return;
          }
          onerror();
        };
        xhr.onerror = onerror;
        xhr.send(null);
      };
    }
  } else {
  }
  var out = Module["print"] || console.log.bind(console);
  var err = Module["printErr"] || console.error.bind(console);
  Object.assign(Module, moduleOverrides);
  moduleOverrides = null;
  if (Module["arguments"]) arguments_ = Module["arguments"];
  if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
  if (Module["quit"]) quit_ = Module["quit"];
  var wasmBinary;
  if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
  if (typeof WebAssembly != "object") {
    abort("no native wasm support detected");
  }
  var wasmMemory;
  var ABORT = false;
  var EXITSTATUS;
  var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
  function updateMemoryViews() {
    var b = wasmMemory.buffer;
    Module["HEAP8"] = HEAP8 = new Int8Array(b);
    Module["HEAP16"] = HEAP16 = new Int16Array(b);
    Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
    Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
    Module["HEAP32"] = HEAP32 = new Int32Array(b);
    Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
    Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
    Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
  }
  var __ATPRERUN__ = [];
  var __ATINIT__ = [];
  var __ATPOSTRUN__ = [];
  var runtimeInitialized = false;
  function preRun() {
    if (Module["preRun"]) {
      if (typeof Module["preRun"] == "function")
        Module["preRun"] = [Module["preRun"]];
      while (Module["preRun"].length) {
        addOnPreRun(Module["preRun"].shift());
      }
    }
    callRuntimeCallbacks(__ATPRERUN__);
  }
  function initRuntime() {
    runtimeInitialized = true;
    if (!Module["noFSInit"] && !FS.init.initialized) FS.init();
    FS.ignorePermissions = false;
    TTY.init();
    callRuntimeCallbacks(__ATINIT__);
  }
  function postRun() {
    if (Module["postRun"]) {
      if (typeof Module["postRun"] == "function")
        Module["postRun"] = [Module["postRun"]];
      while (Module["postRun"].length) {
        addOnPostRun(Module["postRun"].shift());
      }
    }
    callRuntimeCallbacks(__ATPOSTRUN__);
  }
  function addOnPreRun(cb) {
    __ATPRERUN__.unshift(cb);
  }
  function addOnInit(cb) {
    __ATINIT__.unshift(cb);
  }
  function addOnPostRun(cb) {
    __ATPOSTRUN__.unshift(cb);
  }
  var runDependencies = 0;
  var runDependencyWatcher = null;
  var dependenciesFulfilled = null;
  function getUniqueRunDependency(id) {
    return id;
  }
  function addRunDependency(id) {
    runDependencies++;
    Module["monitorRunDependencies"]?.(runDependencies);
  }
  function removeRunDependency(id) {
    runDependencies--;
    Module["monitorRunDependencies"]?.(runDependencies);
    if (runDependencies == 0) {
      if (runDependencyWatcher !== null) {
        clearInterval(runDependencyWatcher);
        runDependencyWatcher = null;
      }
      if (dependenciesFulfilled) {
        var callback = dependenciesFulfilled;
        dependenciesFulfilled = null;
        callback();
      }
    }
  }
  function abort(what) {
    Module["onAbort"]?.(what);
    what = "Aborted(" + what + ")";
    err(what);
    ABORT = true;
    EXITSTATUS = 1;
    what += ". Build with -sASSERTIONS for more info.";
    var e = new WebAssembly.RuntimeError(what);
    throw e;
  }
  var dataURIPrefix = "data:application/octet-stream;base64,";
  var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
  var isFileURI = (filename) => filename.startsWith("file://");
  var wasmBinaryFile;
  wasmBinaryFile = sherpaWASM;
  if (!isDataURI(wasmBinaryFile)) {
    wasmBinaryFile = locateFile(wasmBinaryFile);
  }
  function getBinarySync(file) {
    if (file == wasmBinaryFile && wasmBinary) {
      return new Uint8Array(wasmBinary);
    }
    if (readBinary) {
      return readBinary(file);
    }
    throw "both async and sync fetching of the wasm failed";
  }
  function getBinaryPromise(binaryFile) {
    if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
      if (typeof fetch == "function" && !isFileURI(binaryFile)) {
        return fetch(binaryFile, { credentials: "same-origin" })
          .then((response) => {
            if (!response["ok"]) {
              throw `failed to load wasm binary file at '${binaryFile}'`;
            }
            return response["arrayBuffer"]();
          })
          .catch(() => getBinarySync(binaryFile));
      } else if (readAsync) {
        return new Promise((resolve, reject) => {
          readAsync(
            binaryFile,
            (response) => resolve(new Uint8Array(response)),
            reject
          );
        });
      }
    }
    return Promise.resolve().then(() => getBinarySync(binaryFile));
  }
  function instantiateArrayBuffer(binaryFile, imports, receiver) {
    return getBinaryPromise(binaryFile)
      .then((binary) => WebAssembly.instantiate(binary, imports))
      .then((instance) => instance)
      .then(receiver, (reason) => {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason);
      });
  }
  function instantiateAsync(binary, binaryFile, imports, callback) {
    if (
      !binary &&
      typeof WebAssembly.instantiateStreaming == "function" &&
      !isDataURI(binaryFile) &&
      !isFileURI(binaryFile) &&
      !ENVIRONMENT_IS_NODE &&
      typeof fetch == "function"
    ) {
      return fetch(binaryFile, { credentials: "same-origin" }).then(
        (response) => {
          var result = WebAssembly.instantiateStreaming(response, imports);
          return result.then(callback, function (reason) {
            err(`wasm streaming compile failed: ${reason}`);
            err("falling back to ArrayBuffer instantiation");
            return instantiateArrayBuffer(binaryFile, imports, callback);
          });
        }
      );
    }
    return instantiateArrayBuffer(binaryFile, imports, callback);
  }
  function createWasm() {
    var info = { a: wasmImports };
    function receiveInstance(instance, module) {
      wasmExports = instance.exports;
      wasmMemory = wasmExports["L"];
      updateMemoryViews();
      addOnInit(wasmExports["M"]);
      removeRunDependency("wasm-instantiate");
      return wasmExports;
    }
    addRunDependency("wasm-instantiate");
    function receiveInstantiationResult(result) {
      receiveInstance(result["instance"]);
    }
    if (Module["instantiateWasm"]) {
      try {
        return Module["instantiateWasm"](info, receiveInstance);
      } catch (e) {
        err(`Module.instantiateWasm callback failed with error: ${e}`);
        return false;
      }
    }
    instantiateAsync(
      wasmBinary,
      wasmBinaryFile,
      info,
      receiveInstantiationResult
    );
    return {};
  }
  var tempDouble;
  var tempI64;
  var ASM_CONSTS = {
    1183624: ($0, $1, $2, $3) => {
      if (typeof Module == "undefined" || !Module.MountedFiles) {
        return 1;
      }
      let fileName = UTF8ToString($0 >>> 0);
      if (fileName.startsWith("./")) {
        fileName = fileName.substring(2);
      }
      const fileData = Module.MountedFiles.get(fileName);
      if (!fileData) {
        return 2;
      }
      const offset = $1 >>> 0;
      const length = $2 >>> 0;
      const buffer = $3 >>> 0;
      if (offset + length > fileData.byteLength) {
        return 3;
      }
      try {
        HEAPU8.set(fileData.subarray(offset, offset + length), buffer);
        return 0;
      } catch {
        return 4;
      }
    },
  };
  function ExitStatus(status) {
    this.name = "ExitStatus";
    this.message = `Program terminated with exit(${status})`;
    this.status = status;
  }
  var callRuntimeCallbacks = (callbacks) => {
    while (callbacks.length > 0) {
      callbacks.shift()(Module);
    }
  };
  function getValue(ptr, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        return HEAP8[ptr >> 0];
      case "i8":
        return HEAP8[ptr >> 0];
      case "i16":
        return HEAP16[ptr >> 1];
      case "i32":
        return HEAP32[ptr >> 2];
      case "i64":
        abort("to do getValue(i64) use WASM_BIGINT");
      case "float":
        return HEAPF32[ptr >> 2];
      case "double":
        return HEAPF64[ptr >> 3];
      case "*":
        return HEAPU32[ptr >> 2];
      default:
        abort(`invalid type for getValue: ${type}`);
    }
  }
  var noExitRuntime = Module["noExitRuntime"] || true;
  function setValue(ptr, value, type = "i8") {
    if (type.endsWith("*")) type = "*";
    switch (type) {
      case "i1":
        HEAP8[ptr >> 0] = value;
        break;
      case "i8":
        HEAP8[ptr >> 0] = value;
        break;
      case "i16":
        HEAP16[ptr >> 1] = value;
        break;
      case "i32":
        HEAP32[ptr >> 2] = value;
        break;
      case "i64":
        abort("to do setValue(i64) use WASM_BIGINT");
      case "float":
        HEAPF32[ptr >> 2] = value;
        break;
      case "double":
        HEAPF64[ptr >> 3] = value;
        break;
      case "*":
        HEAPU32[ptr >> 2] = value;
        break;
      default:
        abort(`invalid type for setValue: ${type}`);
    }
  }
  class ExceptionInfo {
    constructor(excPtr) {
      this.excPtr = excPtr;
      this.ptr = excPtr - 24;
    }
    set_type(type) {
      HEAPU32[(this.ptr + 4) >> 2] = type;
    }
    get_type() {
      return HEAPU32[(this.ptr + 4) >> 2];
    }
    set_destructor(destructor) {
      HEAPU32[(this.ptr + 8) >> 2] = destructor;
    }
    get_destructor() {
      return HEAPU32[(this.ptr + 8) >> 2];
    }
    set_caught(caught) {
      caught = caught ? 1 : 0;
      HEAP8[(this.ptr + 12) >> 0] = caught;
    }
    get_caught() {
      return HEAP8[(this.ptr + 12) >> 0] != 0;
    }
    set_rethrown(rethrown) {
      rethrown = rethrown ? 1 : 0;
      HEAP8[(this.ptr + 13) >> 0] = rethrown;
    }
    get_rethrown() {
      return HEAP8[(this.ptr + 13) >> 0] != 0;
    }
    init(type, destructor) {
      this.set_adjusted_ptr(0);
      this.set_type(type);
      this.set_destructor(destructor);
    }
    set_adjusted_ptr(adjustedPtr) {
      HEAPU32[(this.ptr + 16) >> 2] = adjustedPtr;
    }
    get_adjusted_ptr() {
      return HEAPU32[(this.ptr + 16) >> 2];
    }
    get_exception_ptr() {
      var isPointer = ___cxa_is_pointer_type(this.get_type());
      if (isPointer) {
        return HEAPU32[this.excPtr >> 2];
      }
      var adjusted = this.get_adjusted_ptr();
      if (adjusted !== 0) return adjusted;
      return this.excPtr;
    }
  }
  var exceptionLast = 0;
  var uncaughtExceptionCount = 0;
  var ___cxa_throw = (ptr, type, destructor) => {
    var info = new ExceptionInfo(ptr);
    info.init(type, destructor);
    exceptionLast = ptr;
    uncaughtExceptionCount++;
    throw exceptionLast;
  };
  var PATH = {
    isAbs: (path) => path.charAt(0) === "/",
    splitPath: (filename) => {
      var splitPathRe =
        /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    },
    normalizeArray: (parts, allowAboveRoot) => {
      var up = 0;
      for (var i = parts.length - 1; i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (; up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    },
    normalize: (path) => {
      var isAbsolute = PATH.isAbs(path),
        trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(
        path.split("/").filter((p) => !!p),
        !isAbsolute
      ).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    },
    dirname: (path) => {
      var result = PATH.splitPath(path),
        root = result[0],
        dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    },
    basename: (path) => {
      if (path === "/") return "/";
      path = PATH.normalize(path);
      path = path.replace(/\/$/, "");
      var lastSlash = path.lastIndexOf("/");
      if (lastSlash === -1) return path;
      return path.substr(lastSlash + 1);
    },
    join: function () {
      var paths = Array.prototype.slice.call(arguments);
      return PATH.normalize(paths.join("/"));
    },
    join2: (l, r) => PATH.normalize(l + "/" + r),
  };
  var initRandomFill = () => {
    if (
      typeof crypto == "object" &&
      typeof crypto["getRandomValues"] == "function"
    ) {
      return (view) => crypto.getRandomValues(view);
    }
    abort("initRandomDevice");
  };
  var randomFill = (view) => (randomFill = initRandomFill())(view);
  var PATH_FS = {
    resolve: function () {
      var resolvedPath = "",
        resolvedAbsolute = false;
      for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? arguments[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = PATH.isAbs(path);
      }
      resolvedPath = PATH.normalizeArray(
        resolvedPath.split("/").filter((p) => !!p),
        !resolvedAbsolute
      ).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    },
    relative: (from, to) => {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (; start < arr.length; start++) {
          if (arr[start] !== "") break;
        }
        var end = arr.length - 1;
        for (; end >= 0; end--) {
          if (arr[end] !== "") break;
        }
        if (start > end) return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0; i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength; i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    },
  };
  var UTF8Decoder =
    typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;
  var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
    var endIdx = idx + maxBytesToRead;
    var endPtr = idx;
    while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
    if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
      return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
    }
    var str = "";
    while (idx < endPtr) {
      var u0 = heapOrArray[idx++];
      if (!(u0 & 128)) {
        str += String.fromCharCode(u0);
        continue;
      }
      var u1 = heapOrArray[idx++] & 63;
      if ((u0 & 224) == 192) {
        str += String.fromCharCode(((u0 & 31) << 6) | u1);
        continue;
      }
      var u2 = heapOrArray[idx++] & 63;
      if ((u0 & 240) == 224) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 =
          ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (heapOrArray[idx++] & 63);
      }
      if (u0 < 65536) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 65536;
        str += String.fromCharCode(55296 | (ch >> 10), 56320 | (ch & 1023));
      }
    }
    return str;
  };
  var FS_stdin_getChar_buffer = [];
  var lengthBytesUTF8 = (str) => {
    var len = 0;
    for (var i = 0; i < str.length; ++i) {
      var c = str.charCodeAt(i);
      if (c <= 127) {
        len++;
      } else if (c <= 2047) {
        len += 2;
      } else if (c >= 55296 && c <= 57343) {
        len += 4;
        ++i;
      } else {
        len += 3;
      }
    }
    return len;
  };
  var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
    if (!(maxBytesToWrite > 0)) return 0;
    var startIdx = outIdx;
    var endIdx = outIdx + maxBytesToWrite - 1;
    for (var i = 0; i < str.length; ++i) {
      var u = str.charCodeAt(i);
      if (u >= 55296 && u <= 57343) {
        var u1 = str.charCodeAt(++i);
        u = (65536 + ((u & 1023) << 10)) | (u1 & 1023);
      }
      if (u <= 127) {
        if (outIdx >= endIdx) break;
        heap[outIdx++] = u;
      } else if (u <= 2047) {
        if (outIdx + 1 >= endIdx) break;
        heap[outIdx++] = 192 | (u >> 6);
        heap[outIdx++] = 128 | (u & 63);
      } else if (u <= 65535) {
        if (outIdx + 2 >= endIdx) break;
        heap[outIdx++] = 224 | (u >> 12);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      } else {
        if (outIdx + 3 >= endIdx) break;
        heap[outIdx++] = 240 | (u >> 18);
        heap[outIdx++] = 128 | ((u >> 12) & 63);
        heap[outIdx++] = 128 | ((u >> 6) & 63);
        heap[outIdx++] = 128 | (u & 63);
      }
    }
    heap[outIdx] = 0;
    return outIdx - startIdx;
  };
  function intArrayFromString(stringy, dontAddNull, length) {
    var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
    var u8array = new Array(len);
    var numBytesWritten = stringToUTF8Array(
      stringy,
      u8array,
      0,
      u8array.length
    );
    if (dontAddNull) u8array.length = numBytesWritten;
    return u8array;
  }
  var FS_stdin_getChar = () => {
    if (!FS_stdin_getChar_buffer.length) {
      var result = null;
      if (ENVIRONMENT_IS_NODE) {
        var BUFSIZE = 256;
        var buf = Buffer.alloc(BUFSIZE);
        var bytesRead = 0;
        var fd = process.stdin.fd;
        try {
          bytesRead = fs.readSync(fd, buf);
        } catch (e) {
          if (e.toString().includes("EOF")) bytesRead = 0;
          else throw e;
        }
        if (bytesRead > 0) {
          result = buf.slice(0, bytesRead).toString("utf-8");
        } else {
          result = null;
        }
      } else if (
        typeof window != "undefined" &&
        typeof window.prompt == "function"
      ) {
        result = window.prompt("Input: ");
        if (result !== null) {
          result += "\n";
        }
      } else if (typeof readline == "function") {
        result = readline();
        if (result !== null) {
          result += "\n";
        }
      }
      if (!result) {
        return null;
      }
      FS_stdin_getChar_buffer = intArrayFromString(result, true);
    }
    return FS_stdin_getChar_buffer.shift();
  };
  var TTY = {
    ttys: [],
    init() {},
    shutdown() {},
    register(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops: ops };
      FS.registerDevice(dev, TTY.stream_ops);
    },
    stream_ops: {
      open(stream) {
        var tty = TTY.ttys[stream.node.rdev];
        if (!tty) {
          throw new FS.ErrnoError(43);
        }
        stream.tty = tty;
        stream.seekable = false;
      },
      close(stream) {
        stream.tty.ops.fsync(stream.tty);
      },
      fsync(stream) {
        stream.tty.ops.fsync(stream.tty);
      },
      read(stream, buffer, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.get_char) {
          throw new FS.ErrnoError(60);
        }
        var bytesRead = 0;
        for (var i = 0; i < length; i++) {
          var result;
          try {
            result = stream.tty.ops.get_char(stream.tty);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined) break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.timestamp = Date.now();
        }
        return bytesRead;
      },
      write(stream, buffer, offset, length, pos) {
        if (!stream.tty || !stream.tty.ops.put_char) {
          throw new FS.ErrnoError(60);
        }
        try {
          for (var i = 0; i < length; i++) {
            stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
          }
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (length) {
          stream.node.timestamp = Date.now();
        }
        return i;
      },
    },
    default_tty_ops: {
      get_char(tty) {
        return FS_stdin_getChar();
      },
      put_char(tty, val) {
        if (val === null || val === 10) {
          out(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        } else {
          if (val != 0) tty.output.push(val);
        }
      },
      fsync(tty) {
        if (tty.output && tty.output.length > 0) {
          out(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        }
      },
      ioctl_tcgets(tty) {
        return {
          c_iflag: 25856,
          c_oflag: 5,
          c_cflag: 191,
          c_lflag: 35387,
          c_cc: [
            3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
          ],
        };
      },
      ioctl_tcsets(tty, optional_actions, data) {
        return 0;
      },
      ioctl_tiocgwinsz(tty) {
        return [24, 80];
      },
    },
    default_tty1_ops: {
      put_char(tty, val) {
        if (val === null || val === 10) {
          err(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        } else {
          if (val != 0) tty.output.push(val);
        }
      },
      fsync(tty) {
        if (tty.output && tty.output.length > 0) {
          err(UTF8ArrayToString(tty.output, 0));
          tty.output = [];
        }
      },
    },
  };
  var zeroMemory = (address, size) => {
    HEAPU8.fill(0, address, address + size);
    return address;
  };
  var alignMemory = (size, alignment) =>
    Math.ceil(size / alignment) * alignment;
  var mmapAlloc = (size) => {
    size = alignMemory(size, 65536);
    var ptr = _emscripten_builtin_memalign(65536, size);
    if (!ptr) return 0;
    return zeroMemory(ptr, size);
  };
  var MEMFS = {
    ops_table: null,
    mount(mount) {
      return MEMFS.createNode(null, "/", 16384 | 511, 0);
    },
    createNode(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      MEMFS.ops_table ||= {
        dir: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            lookup: MEMFS.node_ops.lookup,
            mknod: MEMFS.node_ops.mknod,
            rename: MEMFS.node_ops.rename,
            unlink: MEMFS.node_ops.unlink,
            rmdir: MEMFS.node_ops.rmdir,
            readdir: MEMFS.node_ops.readdir,
            symlink: MEMFS.node_ops.symlink,
          },
          stream: { llseek: MEMFS.stream_ops.llseek },
        },
        file: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: {
            llseek: MEMFS.stream_ops.llseek,
            read: MEMFS.stream_ops.read,
            write: MEMFS.stream_ops.write,
            allocate: MEMFS.stream_ops.allocate,
            mmap: MEMFS.stream_ops.mmap,
            msync: MEMFS.stream_ops.msync,
          },
        },
        link: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
            readlink: MEMFS.node_ops.readlink,
          },
          stream: {},
        },
        chrdev: {
          node: {
            getattr: MEMFS.node_ops.getattr,
            setattr: MEMFS.node_ops.setattr,
          },
          stream: FS.chrdev_stream_ops,
        },
      };
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.timestamp = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.timestamp = node.timestamp;
      }
      return node;
    },
    getFileDataAsTypedArray(node) {
      if (!node.contents) return new Uint8Array(0);
      if (node.contents.subarray)
        return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    },
    expandFileStorage(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity) return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(
        newCapacity,
        (prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125)) >>>
          0
      );
      if (prevCapacity != 0) newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0)
        node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    },
    resizeFileStorage(node, newSize) {
      if (node.usedBytes == newSize) return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(
            oldContents.subarray(0, Math.min(newSize, node.usedBytes))
          );
        }
        node.usedBytes = newSize;
      }
    },
    node_ops: {
      getattr(node) {
        var attr = {};
        attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
        attr.ino = node.id;
        attr.mode = node.mode;
        attr.nlink = 1;
        attr.uid = 0;
        attr.gid = 0;
        attr.rdev = node.rdev;
        if (FS.isDir(node.mode)) {
          attr.size = 4096;
        } else if (FS.isFile(node.mode)) {
          attr.size = node.usedBytes;
        } else if (FS.isLink(node.mode)) {
          attr.size = node.link.length;
        } else {
          attr.size = 0;
        }
        attr.atime = new Date(node.timestamp);
        attr.mtime = new Date(node.timestamp);
        attr.ctime = new Date(node.timestamp);
        attr.blksize = 4096;
        attr.blocks = Math.ceil(attr.size / attr.blksize);
        return attr;
      },
      setattr(node, attr) {
        if (attr.mode !== undefined) {
          node.mode = attr.mode;
        }
        if (attr.timestamp !== undefined) {
          node.timestamp = attr.timestamp;
        }
        if (attr.size !== undefined) {
          MEMFS.resizeFileStorage(node, attr.size);
        }
      },
      lookup(parent, name) {
        throw FS.genericErrors[44];
      },
      mknod(parent, name, mode, dev) {
        return MEMFS.createNode(parent, name, mode, dev);
      },
      rename(old_node, new_dir, new_name) {
        if (FS.isDir(old_node.mode)) {
          var new_node;
          try {
            new_node = FS.lookupNode(new_dir, new_name);
          } catch (e) {}
          if (new_node) {
            for (var i in new_node.contents) {
              throw new FS.ErrnoError(55);
            }
          }
        }
        delete old_node.parent.contents[old_node.name];
        old_node.parent.timestamp = Date.now();
        old_node.name = new_name;
        new_dir.contents[new_name] = old_node;
        new_dir.timestamp = old_node.parent.timestamp;
        old_node.parent = new_dir;
      },
      unlink(parent, name) {
        delete parent.contents[name];
        parent.timestamp = Date.now();
      },
      rmdir(parent, name) {
        var node = FS.lookupNode(parent, name);
        for (var i in node.contents) {
          throw new FS.ErrnoError(55);
        }
        delete parent.contents[name];
        parent.timestamp = Date.now();
      },
      readdir(node) {
        var entries = [".", ".."];
        for (var key of Object.keys(node.contents)) {
          entries.push(key);
        }
        return entries;
      },
      symlink(parent, newname, oldpath) {
        var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
        node.link = oldpath;
        return node;
      },
      readlink(node) {
        if (!FS.isLink(node.mode)) {
          throw new FS.ErrnoError(28);
        }
        return node.link;
      },
    },
    stream_ops: {
      read(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= stream.node.usedBytes) return 0;
        var size = Math.min(stream.node.usedBytes - position, length);
        if (size > 8 && contents.subarray) {
          buffer.set(contents.subarray(position, position + size), offset);
        } else {
          for (var i = 0; i < size; i++)
            buffer[offset + i] = contents[position + i];
        }
        return size;
      },
      write(stream, buffer, offset, length, position, canOwn) {
        if (buffer.buffer === HEAP8.buffer) {
          canOwn = false;
        }
        if (!length) return 0;
        var node = stream.node;
        node.timestamp = Date.now();
        if (buffer.subarray && (!node.contents || node.contents.subarray)) {
          if (canOwn) {
            node.contents = buffer.subarray(offset, offset + length);
            node.usedBytes = length;
            return length;
          } else if (node.usedBytes === 0 && position === 0) {
            node.contents = buffer.slice(offset, offset + length);
            node.usedBytes = length;
            return length;
          } else if (position + length <= node.usedBytes) {
            node.contents.set(
              buffer.subarray(offset, offset + length),
              position
            );
            return length;
          }
        }
        MEMFS.expandFileStorage(node, position + length);
        if (node.contents.subarray && buffer.subarray) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
        } else {
          for (var i = 0; i < length; i++) {
            node.contents[position + i] = buffer[offset + i];
          }
        }
        node.usedBytes = Math.max(node.usedBytes, position + length);
        return length;
      },
      llseek(stream, offset, whence) {
        var position = offset;
        if (whence === 1) {
          position += stream.position;
        } else if (whence === 2) {
          if (FS.isFile(stream.node.mode)) {
            position += stream.node.usedBytes;
          }
        }
        if (position < 0) {
          throw new FS.ErrnoError(28);
        }
        return position;
      },
      allocate(stream, offset, length) {
        MEMFS.expandFileStorage(stream.node, offset + length);
        stream.node.usedBytes = Math.max(
          stream.node.usedBytes,
          offset + length
        );
      },
      mmap(stream, length, position, prot, flags) {
        if (!FS.isFile(stream.node.mode)) {
          throw new FS.ErrnoError(43);
        }
        var ptr;
        var allocated;
        var contents = stream.node.contents;
        if (!(flags & 2) && contents.buffer === HEAP8.buffer) {
          allocated = false;
          ptr = contents.byteOffset;
        } else {
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(
                contents,
                position,
                position + length
              );
            }
          }
          allocated = true;
          ptr = mmapAlloc(length);
          if (!ptr) {
            throw new FS.ErrnoError(48);
          }
          HEAP8.set(contents, ptr);
        }
        return { ptr: ptr, allocated: allocated };
      },
      msync(stream, buffer, offset, length, mmapFlags) {
        MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
        return 0;
      },
    },
  };
  var asyncLoad = (url, onload, onerror, noRunDep) => {
    var dep = !noRunDep ? getUniqueRunDependency(`al ${url}`) : "";
    readAsync(
      url,
      (arrayBuffer) => {
        onload(new Uint8Array(arrayBuffer));
        if (dep) removeRunDependency(dep);
      },
      (event) => {
        if (onerror) {
          onerror();
        } else {
          throw `Loading data file "${url}" failed.`;
        }
      }
    );
    if (dep) addRunDependency(dep);
  };
  var FS_createDataFile = (
    parent,
    name,
    fileData,
    canRead,
    canWrite,
    canOwn
  ) => {
    FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
  };
  var preloadPlugins = Module["preloadPlugins"] || [];
  var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
    if (typeof Browser != "undefined") Browser.init();
    var handled = false;
    preloadPlugins.forEach((plugin) => {
      if (handled) return;
      if (plugin["canHandle"](fullname)) {
        plugin["handle"](byteArray, fullname, finish, onerror);
        handled = true;
      }
    });
    return handled;
  };
  var FS_createPreloadedFile = (
    parent,
    name,
    url,
    canRead,
    canWrite,
    onload,
    onerror,
    dontCreateFile,
    canOwn,
    preFinish
  ) => {
    var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
    var dep = getUniqueRunDependency(`cp ${fullname}`);
    function processData(byteArray) {
      function finish(byteArray) {
        preFinish?.();
        if (!dontCreateFile) {
          FS_createDataFile(parent, name, byteArray, canRead, canWrite, canOwn);
        }
        onload?.();
        removeRunDependency(dep);
      }
      if (
        FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })
      ) {
        return;
      }
      finish(byteArray);
    }
    addRunDependency(dep);
    if (typeof url == "string") {
      asyncLoad(url, processData, onerror);
    } else {
      processData(url);
    }
  };
  var FS_modeStringToFlags = (str) => {
    var flagModes = {
      r: 0,
      "r+": 2,
      w: 512 | 64 | 1,
      "w+": 512 | 64 | 2,
      a: 1024 | 64 | 1,
      "a+": 1024 | 64 | 2,
    };
    var flags = flagModes[str];
    if (typeof flags == "undefined") {
      throw new Error(`Unknown file open mode: ${str}`);
    }
    return flags;
  };
  var FS_getMode = (canRead, canWrite) => {
    var mode = 0;
    if (canRead) mode |= 292 | 73;
    if (canWrite) mode |= 146;
    return mode;
  };
  var FS = {
    root: null,
    mounts: [],
    devices: {},
    streams: [],
    nextInode: 1,
    nameTable: null,
    currentPath: "/",
    initialized: false,
    ignorePermissions: true,
    ErrnoError: class {
      constructor(errno) {
        this.name = "ErrnoError";
        this.errno = errno;
      }
    },
    genericErrors: {},
    filesystems: null,
    syncFSRequests: 0,
    lookupPath(path, opts = {}) {
      path = PATH_FS.resolve(path);
      if (!path) return { path: "", node: null };
      var defaults = { follow_mount: true, recurse_count: 0 };
      opts = Object.assign(defaults, opts);
      if (opts.recurse_count > 8) {
        throw new FS.ErrnoError(32);
      }
      var parts = path.split("/").filter((p) => !!p);
      var current = FS.root;
      var current_path = "/";
      for (var i = 0; i < parts.length; i++) {
        var islast = i === parts.length - 1;
        if (islast && opts.parent) {
          break;
        }
        current = FS.lookupNode(current, parts[i]);
        current_path = PATH.join2(current_path, parts[i]);
        if (FS.isMountpoint(current)) {
          if (!islast || (islast && opts.follow_mount)) {
            current = current.mounted.root;
          }
        }
        if (!islast || opts.follow) {
          var count = 0;
          while (FS.isLink(current.mode)) {
            var link = FS.readlink(current_path);
            current_path = PATH_FS.resolve(PATH.dirname(current_path), link);
            var lookup = FS.lookupPath(current_path, {
              recurse_count: opts.recurse_count + 1,
            });
            current = lookup.node;
            if (count++ > 40) {
              throw new FS.ErrnoError(32);
            }
          }
        }
      }
      return { path: current_path, node: current };
    },
    getPath(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path) return mount;
          return mount[mount.length - 1] !== "/"
            ? `${mount}/${path}`
            : mount + path;
        }
        path = path ? `${node.name}/${path}` : node.name;
        node = node.parent;
      }
    },
    hashName(parentid, name) {
      var hash = 0;
      for (var i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
      }
      return ((parentid + hash) >>> 0) % FS.nameTable.length;
    },
    hashAddNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    },
    hashRemoveNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    },
    lookupNode(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash]; node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    },
    createNode(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    },
    destroyNode(node) {
      FS.hashRemoveNode(node);
    },
    isRoot(node) {
      return node === node.parent;
    },
    isMountpoint(node) {
      return !!node.mounted;
    },
    isFile(mode) {
      return (mode & 61440) === 32768;
    },
    isDir(mode) {
      return (mode & 61440) === 16384;
    },
    isLink(mode) {
      return (mode & 61440) === 40960;
    },
    isChrdev(mode) {
      return (mode & 61440) === 8192;
    },
    isBlkdev(mode) {
      return (mode & 61440) === 24576;
    },
    isFIFO(mode) {
      return (mode & 61440) === 4096;
    },
    isSocket(mode) {
      return (mode & 49152) === 49152;
    },
    flagsToPermissionString(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    },
    nodePermissions(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    },
    mayLookup(dir) {
      if (!FS.isDir(dir.mode)) return 54;
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode) return errCode;
      if (!dir.node_ops.lookup) return 2;
      return 0;
    },
    mayCreate(dir, name) {
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {}
      return FS.nodePermissions(dir, "wx");
    },
    mayDelete(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    },
    mayOpen(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & 512) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    },
    MAX_OPEN_FDS: 4096,
    nextfd() {
      for (var fd = 0; fd <= FS.MAX_OPEN_FDS; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    },
    getStreamChecked(fd) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      return stream;
    },
    getStream: (fd) => FS.streams[fd],
    createStream(stream, fd = -1) {
      if (!FS.FSStream) {
        FS.FSStream = function () {
          this.shared = {};
        };
        FS.FSStream.prototype = {};
        Object.defineProperties(FS.FSStream.prototype, {
          object: {
            get() {
              return this.node;
            },
            set(val) {
              this.node = val;
            },
          },
          isRead: {
            get() {
              return (this.flags & 2097155) !== 1;
            },
          },
          isWrite: {
            get() {
              return (this.flags & 2097155) !== 0;
            },
          },
          isAppend: {
            get() {
              return this.flags & 1024;
            },
          },
          flags: {
            get() {
              return this.shared.flags;
            },
            set(val) {
              this.shared.flags = val;
            },
          },
          position: {
            get() {
              return this.shared.position;
            },
            set(val) {
              this.shared.position = val;
            },
          },
        });
      }
      stream = Object.assign(new FS.FSStream(), stream);
      if (fd == -1) {
        fd = FS.nextfd();
      }
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    },
    closeStream(fd) {
      FS.streams[fd] = null;
    },
    chrdev_stream_ops: {
      open(stream) {
        var device = FS.getDevice(stream.node.rdev);
        stream.stream_ops = device.stream_ops;
        stream.stream_ops.open?.(stream);
      },
      llseek() {
        throw new FS.ErrnoError(70);
      },
    },
    major: (dev) => dev >> 8,
    minor: (dev) => dev & 255,
    makedev: (ma, mi) => (ma << 8) | mi,
    registerDevice(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    },
    getDevice: (dev) => FS.devices[dev],
    getMounts(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push.apply(check, m.mounts);
      }
      return mounts;
    },
    syncfs(populate, callback) {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err(
          `warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`
        );
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    },
    mount(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = {
        type: type,
        opts: opts,
        mountpoint: mountpoint,
        mounts: [],
      };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    },
    unmount(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    },
    lookup(parent, name) {
      return parent.node_ops.lookup(parent, name);
    },
    mknod(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name || name === "." || name === "..") {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    },
    create(path, mode) {
      mode = mode !== undefined ? mode : 438;
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    },
    mkdir(path, mode) {
      mode = mode !== undefined ? mode : 511;
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    },
    mkdirTree(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i = 0; i < dirs.length; ++i) {
        if (!dirs[i]) continue;
        d += "/" + dirs[i];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20) throw e;
        }
      }
    },
    mkdev(path, mode, dev) {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    },
    symlink(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    },
    rename(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir) throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {}
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node
        ? FS.mayDelete(new_dir, new_name, isdir)
        : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (
        FS.isMountpoint(old_node) ||
        (new_node && FS.isMountpoint(new_node))
      ) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    },
    rmdir(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    },
    readdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      if (!node.node_ops.readdir) {
        throw new FS.ErrnoError(54);
      }
      return node.node_ops.readdir(node);
    },
    unlink(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    },
    readlink(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return PATH_FS.resolve(
        FS.getPath(link.parent),
        link.node_ops.readlink(link)
      );
    },
    stat(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (!node.node_ops.getattr) {
        throw new FS.ErrnoError(63);
      }
      return node.node_ops.getattr(node);
    },
    lstat(path) {
      return FS.stat(path, true);
    },
    chmod(path, mode, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, {
        mode: (mode & 4095) | (node.mode & ~4095),
        timestamp: Date.now(),
      });
    },
    lchmod(path, mode) {
      FS.chmod(path, mode, true);
    },
    fchmod(fd, mode) {
      var stream = FS.getStreamChecked(fd);
      FS.chmod(stream.node, mode);
    },
    chown(path, uid, gid, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      node.node_ops.setattr(node, { timestamp: Date.now() });
    },
    lchown(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    },
    fchown(fd, uid, gid) {
      var stream = FS.getStreamChecked(fd);
      FS.chown(stream.node, uid, gid);
    },
    truncate(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (!node.node_ops.setattr) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      node.node_ops.setattr(node, { size: len, timestamp: Date.now() });
    },
    ftruncate(fd, len) {
      var stream = FS.getStreamChecked(fd);
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    },
    utime(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      node.node_ops.setattr(node, { timestamp: Math.max(atime, mtime) });
    },
    open(path, flags, mode) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
      mode = typeof mode == "undefined" ? 438 : mode;
      if (flags & 64) {
        mode = (mode & 4095) | 32768;
      } else {
        mode = 0;
      }
      var node;
      if (typeof path == "object") {
        node = path;
      } else {
        path = PATH.normalize(path);
        try {
          var lookup = FS.lookupPath(path, { follow: !(flags & 131072) });
          node = lookup.node;
        } catch (e) {}
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else {
          node = FS.mknod(path, mode, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512 && !created) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({
        node: node,
        path: FS.getPath(node),
        flags: flags,
        seekable: true,
        position: 0,
        stream_ops: node.stream_ops,
        ungotten: [],
        error: false,
      });
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (Module["logReadFiles"] && !(flags & 1)) {
        if (!FS.readFiles) FS.readFiles = {};
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    },
    close(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents) stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    },
    isClosed(stream) {
      return stream.fd === null;
    },
    llseek(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    },
    read(stream, buffer, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(
        stream,
        buffer,
        offset,
        length,
        position
      );
      if (!seeking) stream.position += bytesRead;
      return bytesRead;
    },
    write(stream, buffer, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(
        stream,
        buffer,
        offset,
        length,
        position,
        canOwn
      );
      if (!seeking) stream.position += bytesWritten;
      return bytesWritten;
    },
    allocate(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    },
    mmap(stream, length, position, prot, flags) {
      if (
        (prot & 2) !== 0 &&
        (flags & 2) === 0 &&
        (stream.flags & 2097155) !== 2
      ) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      return stream.stream_ops.mmap(stream, length, position, prot, flags);
    },
    msync(stream, buffer, offset, length, mmapFlags) {
      if (!stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    },
    munmap: (stream) => 0,
    ioctl(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    },
    readFile(path, opts = {}) {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error(`Invalid encoding type "${opts.encoding}"`);
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf, 0);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    },
    writeFile(path, data, opts = {}) {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    },
    cwd: () => FS.currentPath,
    chdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    },
    createDefaultDirectories() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    },
    createDefaultDevices() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), {
        read: () => 0,
        write: (stream, buffer, offset, length, pos) => length,
      });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var randomBuffer = new Uint8Array(1024),
        randomLeft = 0;
      var randomByte = () => {
        if (randomLeft === 0) {
          randomLeft = randomFill(randomBuffer).byteLength;
        }
        return randomBuffer[--randomLeft];
      };
      FS.createDevice("/dev", "random", randomByte);
      FS.createDevice("/dev", "urandom", randomByte);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    },
    createSpecialDirectories() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount(
        {
          mount() {
            var node = FS.createNode(proc_self, "fd", 16384 | 511, 73);
            node.node_ops = {
              lookup(parent, name) {
                var fd = +name;
                var stream = FS.getStreamChecked(fd);
                var ret = {
                  parent: null,
                  mount: { mountpoint: "fake" },
                  node_ops: { readlink: () => stream.path },
                };
                ret.parent = ret;
                return ret;
              },
            };
            return node;
          },
        },
        {},
        "/proc/self/fd"
      );
    },
    createStandardStreams() {
      if (Module["stdin"]) {
        FS.createDevice("/dev", "stdin", Module["stdin"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (Module["stdout"]) {
        FS.createDevice("/dev", "stdout", null, Module["stdout"]);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (Module["stderr"]) {
        FS.createDevice("/dev", "stderr", null, Module["stderr"]);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    },
    staticInit() {
      [44].forEach((code) => {
        FS.genericErrors[code] = new FS.ErrnoError(code);
        FS.genericErrors[code].stack = "<generic error, no stack>";
      });
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { MEMFS: MEMFS };
    },
    init(input, output, error) {
      FS.init.initialized = true;
      Module["stdin"] = input || Module["stdin"];
      Module["stdout"] = output || Module["stdout"];
      Module["stderr"] = error || Module["stderr"];
      FS.createStandardStreams();
    },
    quit() {
      FS.init.initialized = false;
      for (var i = 0; i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    },
    findObject(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (!ret.exists) {
        return null;
      }
      return ret.object;
    },
    analyzePath(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {}
      var ret = {
        isRoot: false,
        exists: false,
        error: 0,
        name: null,
        path: null,
        object: null,
        parentExists: false,
        parentPath: null,
        parentObject: null,
      };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    },
    createPath(parent, path, canRead, canWrite) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part) continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {}
        parent = current;
      }
      return current;
    },
    createFile(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(
        typeof parent == "string" ? parent : FS.getPath(parent),
        name
      );
      var mode = FS_getMode(canRead, canWrite);
      return FS.create(path, mode);
    },
    createDataFile(parent, name, data, canRead, canWrite, canOwn) {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS_getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length; i < len; ++i)
            arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
    },
    createDevice(parent, name, input, output) {
      var path = PATH.join2(
        typeof parent == "string" ? parent : FS.getPath(parent),
        name
      );
      var mode = FS_getMode(!!input, !!output);
      if (!FS.createDevice.major) FS.createDevice.major = 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, {
        open(stream) {
          stream.seekable = false;
        },
        close(stream) {
          if (output?.buffer?.length) {
            output(10);
          }
        },
        read(stream, buffer, offset, length, pos) {
          var bytesRead = 0;
          for (var i = 0; i < length; i++) {
            var result;
            try {
              result = input();
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
            if (result === undefined && bytesRead === 0) {
              throw new FS.ErrnoError(6);
            }
            if (result === null || result === undefined) break;
            bytesRead++;
            buffer[offset + i] = result;
          }
          if (bytesRead) {
            stream.node.timestamp = Date.now();
          }
          return bytesRead;
        },
        write(stream, buffer, offset, length, pos) {
          for (var i = 0; i < length; i++) {
            try {
              output(buffer[offset + i]);
            } catch (e) {
              throw new FS.ErrnoError(29);
            }
          }
          if (length) {
            stream.node.timestamp = Date.now();
          }
          return i;
        },
      });
      return FS.mkdev(path, mode, dev);
    },
    forceLoadFile(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents) return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error(
          "Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread."
        );
      } else if (read_) {
        try {
          obj.contents = intArrayFromString(read_(obj.url), true);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      } else {
        throw new Error("Cannot load without read() or XMLHttpRequest.");
      }
    },
    createLazyFile(parent, name, url, canRead, canWrite) {
      function LazyUint8Array() {
        this.lengthKnown = false;
        this.chunks = [];
      }
      LazyUint8Array.prototype.get = function LazyUint8Array_get(idx) {
        if (idx > this.length - 1 || idx < 0) {
          return undefined;
        }
        var chunkOffset = idx % this.chunkSize;
        var chunkNum = (idx / this.chunkSize) | 0;
        return this.getter(chunkNum)[chunkOffset];
      };
      LazyUint8Array.prototype.setDataGetter =
        function LazyUint8Array_setDataGetter(getter) {
          this.getter = getter;
        };
      LazyUint8Array.prototype.cacheLength =
        function LazyUint8Array_cacheLength() {
          var xhr = new XMLHttpRequest();
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing =
            (header = xhr.getResponseHeader("Accept-Ranges")) &&
            header === "bytes";
          var usesGzip =
            (header = xhr.getResponseHeader("Content-Encoding")) &&
            header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing) chunkSize = datalength;
          var doXHR = (from, to) => {
            if (from > to)
              throw new Error(
                "invalid range (" +
                  from +
                  ", " +
                  to +
                  ") or no bytes requested!"
              );
            if (to > datalength - 1)
              throw new Error(
                "only " + datalength + " bytes available! programmer error!"
              );
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            if (datalength !== chunkSize)
              xhr.setRequestHeader("Range", "bytes=" + from + "-" + to);
            xhr.responseType = "arraybuffer";
            if (xhr.overrideMimeType) {
              xhr.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr.send(null);
            if (
              !((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304)
            )
              throw new Error(
                "Couldn't load " + url + ". Status: " + xhr.status
              );
            if (xhr.response !== undefined) {
              return new Uint8Array(xhr.response || []);
            }
            return intArrayFromString(xhr.responseText || "", true);
          };
          var lazyArray = this;
          lazyArray.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray.chunks[chunkNum] == "undefined") {
              lazyArray.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray.chunks[chunkNum] == "undefined")
              throw new Error("doXHR failed!");
            return lazyArray.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out(
              "LazyFiles on gzip forces download of the whole file when length is accessed"
            );
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        };
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER)
          throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array();
        Object.defineProperties(lazyArray, {
          length: {
            get: function () {
              if (!this.lengthKnown) {
                this.cacheLength();
              }
              return this._length;
            },
          },
          chunkSize: {
            get: function () {
              if (!this.lengthKnown) {
                this.cacheLength();
              }
              return this._chunkSize;
            },
          },
        });
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url: url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, {
        usedBytes: {
          get: function () {
            return this.contents.length;
          },
        },
      });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = function forceLoadLazyFile() {
          FS.forceLoadFile(node);
          return fn.apply(null, arguments);
        };
      });
      function writeChunks(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= contents.length) return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0; i < size; i++) {
            buffer[offset + i] = contents.get(position + i);
          }
        }
        return size;
      }
      stream_ops.read = (stream, buffer, offset, length, position) => {
        FS.forceLoadFile(node);
        return writeChunks(stream, buffer, offset, length, position);
      };
      stream_ops.mmap = (stream, length, position, prot, flags) => {
        FS.forceLoadFile(node);
        var ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        writeChunks(stream, HEAP8, ptr, length, position);
        return { ptr: ptr, allocated: true };
      };
      node.stream_ops = stream_ops;
      return node;
    },
  };
  var UTF8ToString = (ptr, maxBytesToRead) =>
    ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
  var SYSCALLS = {
    DEFAULT_POLLMASK: 5,
    calculateAt(dirfd, path, allowEmpty) {
      if (PATH.isAbs(path)) {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return PATH.join2(dir, path);
    },
    doStat(func, path, buf) {
      var stat = func(path);
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[(buf + 4) >> 2] = stat.mode;
      HEAPU32[(buf + 8) >> 2] = stat.nlink;
      HEAP32[(buf + 12) >> 2] = stat.uid;
      HEAP32[(buf + 16) >> 2] = stat.gid;
      HEAP32[(buf + 20) >> 2] = stat.rdev;
      (tempI64 = [
        stat.size >>> 0,
        ((tempDouble = stat.size),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[(buf + 24) >> 2] = tempI64[0]),
        (HEAP32[(buf + 28) >> 2] = tempI64[1]);
      HEAP32[(buf + 32) >> 2] = 4096;
      HEAP32[(buf + 36) >> 2] = stat.blocks;
      var atime = stat.atime.getTime();
      var mtime = stat.mtime.getTime();
      var ctime = stat.ctime.getTime();
      (tempI64 = [
        Math.floor(atime / 1e3) >>> 0,
        ((tempDouble = Math.floor(atime / 1e3)),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[(buf + 40) >> 2] = tempI64[0]),
        (HEAP32[(buf + 44) >> 2] = tempI64[1]);
      HEAPU32[(buf + 48) >> 2] = (atime % 1e3) * 1e3;
      (tempI64 = [
        Math.floor(mtime / 1e3) >>> 0,
        ((tempDouble = Math.floor(mtime / 1e3)),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[(buf + 56) >> 2] = tempI64[0]),
        (HEAP32[(buf + 60) >> 2] = tempI64[1]);
      HEAPU32[(buf + 64) >> 2] = (mtime % 1e3) * 1e3;
      (tempI64 = [
        Math.floor(ctime / 1e3) >>> 0,
        ((tempDouble = Math.floor(ctime / 1e3)),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[(buf + 72) >> 2] = tempI64[0]),
        (HEAP32[(buf + 76) >> 2] = tempI64[1]);
      HEAPU32[(buf + 80) >> 2] = (ctime % 1e3) * 1e3;
      (tempI64 = [
        stat.ino >>> 0,
        ((tempDouble = stat.ino),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[(buf + 88) >> 2] = tempI64[0]),
        (HEAP32[(buf + 92) >> 2] = tempI64[1]);
      return 0;
    },
    doMsync(addr, stream, len, flags, offset) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (flags & 2) {
        return 0;
      }
      var buffer = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer, offset, len, flags);
    },
    varargs: undefined,
    get() {
      var ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    },
    getp() {
      return SYSCALLS.get();
    },
    getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    },
    getStreamFromFD(fd) {
      var stream = FS.getStreamChecked(fd);
      return stream;
    },
  };
  function ___syscall_fcntl64(fd, cmd, varargs) {
    SYSCALLS.varargs = varargs;
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (cmd) {
        case 0: {
          var arg = SYSCALLS.get();
          if (arg < 0) {
            return -28;
          }
          while (FS.streams[arg]) {
            arg++;
          }
          var newStream;
          newStream = FS.createStream(stream, arg);
          return newStream.fd;
        }
        case 1:
        case 2:
          return 0;
        case 3:
          return stream.flags;
        case 4: {
          var arg = SYSCALLS.get();
          stream.flags |= arg;
          return 0;
        }
        case 12: {
          var arg = SYSCALLS.getp();
          var offset = 0;
          HEAP16[(arg + offset) >> 1] = 2;
          return 0;
        }
        case 13:
        case 14:
          return 0;
      }
      return -28;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_fstat64(fd, buf) {
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      return SYSCALLS.doStat(FS.stat, stream.path, buf);
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  var stringToUTF8 = (str, outPtr, maxBytesToWrite) =>
    stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
  function ___syscall_getcwd(buf, size) {
    try {
      if (size === 0) return -28;
      var cwd = FS.cwd();
      var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
      if (size < cwdLengthInBytes) return -68;
      stringToUTF8(cwd, buf, size);
      return cwdLengthInBytes;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_getdents64(fd, dirp, count) {
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      stream.getdents ||= FS.readdir(stream.path);
      var struct_size = 280;
      var pos = 0;
      var off = FS.llseek(stream, 0, 1);
      var idx = Math.floor(off / struct_size);
      while (idx < stream.getdents.length && pos + struct_size <= count) {
        var id;
        var type;
        var name = stream.getdents[idx];
        if (name === ".") {
          id = stream.node.id;
          type = 4;
        } else if (name === "..") {
          var lookup = FS.lookupPath(stream.path, { parent: true });
          id = lookup.node.id;
          type = 4;
        } else {
          var child = FS.lookupNode(stream.node, name);
          id = child.id;
          type = FS.isChrdev(child.mode)
            ? 2
            : FS.isDir(child.mode)
            ? 4
            : FS.isLink(child.mode)
            ? 10
            : 8;
        }
        (tempI64 = [
          id >>> 0,
          ((tempDouble = id),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(dirp + pos) >> 2] = tempI64[0]),
          (HEAP32[(dirp + pos + 4) >> 2] = tempI64[1]);
        (tempI64 = [
          ((idx + 1) * struct_size) >>> 0,
          ((tempDouble = (idx + 1) * struct_size),
          +Math.abs(tempDouble) >= 1
            ? tempDouble > 0
              ? +Math.floor(tempDouble / 4294967296) >>> 0
              : ~~+Math.ceil(
                  (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
                ) >>> 0
            : 0),
        ]),
          (HEAP32[(dirp + pos + 8) >> 2] = tempI64[0]),
          (HEAP32[(dirp + pos + 12) >> 2] = tempI64[1]);
        HEAP16[(dirp + pos + 16) >> 1] = 280;
        HEAP8[(dirp + pos + 18) >> 0] = type;
        stringToUTF8(name, dirp + pos + 19, 256);
        pos += struct_size;
        idx += 1;
      }
      FS.llseek(stream, idx * struct_size, 0);
      return pos;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_ioctl(fd, op, varargs) {
    SYSCALLS.varargs = varargs;
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      switch (op) {
        case 21509: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21505: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcgets) {
            var termios = stream.tty.ops.ioctl_tcgets(stream);
            var argp = SYSCALLS.getp();
            HEAP32[argp >> 2] = termios.c_iflag || 0;
            HEAP32[(argp + 4) >> 2] = termios.c_oflag || 0;
            HEAP32[(argp + 8) >> 2] = termios.c_cflag || 0;
            HEAP32[(argp + 12) >> 2] = termios.c_lflag || 0;
            for (var i = 0; i < 32; i++) {
              HEAP8[(argp + i + 17) >> 0] = termios.c_cc[i] || 0;
            }
            return 0;
          }
          return 0;
        }
        case 21510:
        case 21511:
        case 21512: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21506:
        case 21507:
        case 21508: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tcsets) {
            var argp = SYSCALLS.getp();
            var c_iflag = HEAP32[argp >> 2];
            var c_oflag = HEAP32[(argp + 4) >> 2];
            var c_cflag = HEAP32[(argp + 8) >> 2];
            var c_lflag = HEAP32[(argp + 12) >> 2];
            var c_cc = [];
            for (var i = 0; i < 32; i++) {
              c_cc.push(HEAP8[(argp + i + 17) >> 0]);
            }
            return stream.tty.ops.ioctl_tcsets(stream.tty, op, {
              c_iflag: c_iflag,
              c_oflag: c_oflag,
              c_cflag: c_cflag,
              c_lflag: c_lflag,
              c_cc: c_cc,
            });
          }
          return 0;
        }
        case 21519: {
          if (!stream.tty) return -59;
          var argp = SYSCALLS.getp();
          HEAP32[argp >> 2] = 0;
          return 0;
        }
        case 21520: {
          if (!stream.tty) return -59;
          return -28;
        }
        case 21531: {
          var argp = SYSCALLS.getp();
          return FS.ioctl(stream, op, argp);
        }
        case 21523: {
          if (!stream.tty) return -59;
          if (stream.tty.ops.ioctl_tiocgwinsz) {
            var winsize = stream.tty.ops.ioctl_tiocgwinsz(stream.tty);
            var argp = SYSCALLS.getp();
            HEAP16[argp >> 1] = winsize[0];
            HEAP16[(argp + 2) >> 1] = winsize[1];
          }
          return 0;
        }
        case 21524: {
          if (!stream.tty) return -59;
          return 0;
        }
        case 21515: {
          if (!stream.tty) return -59;
          return 0;
        }
        default:
          return -28;
      }
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_lstat64(path, buf) {
    try {
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.lstat, path, buf);
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_mkdirat(dirfd, path, mode) {
    try {
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      path = PATH.normalize(path);
      if (path[path.length - 1] === "/") path = path.substr(0, path.length - 1);
      FS.mkdir(path, mode, 0);
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_newfstatat(dirfd, path, buf, flags) {
    try {
      path = SYSCALLS.getStr(path);
      var nofollow = flags & 256;
      var allowEmpty = flags & 4096;
      flags = flags & ~6400;
      path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
      return SYSCALLS.doStat(nofollow ? FS.lstat : FS.stat, path, buf);
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_openat(dirfd, path, flags, varargs) {
    SYSCALLS.varargs = varargs;
    try {
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      var mode = varargs ? SYSCALLS.get() : 0;
      return FS.open(path, flags, mode).fd;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
    try {
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (bufsize <= 0) return -28;
      var ret = FS.readlink(path);
      var len = Math.min(bufsize, lengthBytesUTF8(ret));
      var endChar = HEAP8[buf + len];
      stringToUTF8(ret, buf, bufsize + 1);
      HEAP8[buf + len] = endChar;
      return len;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_rmdir(path) {
    try {
      path = SYSCALLS.getStr(path);
      FS.rmdir(path);
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_stat64(path, buf) {
    try {
      path = SYSCALLS.getStr(path);
      return SYSCALLS.doStat(FS.stat, path, buf);
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function ___syscall_unlinkat(dirfd, path, flags) {
    try {
      path = SYSCALLS.getStr(path);
      path = SYSCALLS.calculateAt(dirfd, path);
      if (flags === 0) {
        FS.unlink(path);
      } else if (flags === 512) {
        FS.rmdir(path);
      } else {
        abort("Invalid flags passed to unlinkat");
      }
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  var nowIsMonotonic = 1;
  var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
  var convertI32PairToI53Checked = (lo, hi) =>
    (hi + 2097152) >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
  function __gmtime_js(time_low, time_high, tmPtr) {
    var time = convertI32PairToI53Checked(time_low, time_high);
    var date = new Date(time * 1e3);
    HEAP32[tmPtr >> 2] = date.getUTCSeconds();
    HEAP32[(tmPtr + 4) >> 2] = date.getUTCMinutes();
    HEAP32[(tmPtr + 8) >> 2] = date.getUTCHours();
    HEAP32[(tmPtr + 12) >> 2] = date.getUTCDate();
    HEAP32[(tmPtr + 16) >> 2] = date.getUTCMonth();
    HEAP32[(tmPtr + 20) >> 2] = date.getUTCFullYear() - 1900;
    HEAP32[(tmPtr + 24) >> 2] = date.getUTCDay();
    var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
    var yday = ((date.getTime() - start) / (1e3 * 60 * 60 * 24)) | 0;
    HEAP32[(tmPtr + 28) >> 2] = yday;
  }
  var isLeapYear = (year) =>
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  var MONTH_DAYS_LEAP_CUMULATIVE = [
    0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335,
  ];
  var MONTH_DAYS_REGULAR_CUMULATIVE = [
    0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334,
  ];
  var ydayFromDate = (date) => {
    var leap = isLeapYear(date.getFullYear());
    var monthDaysCumulative = leap
      ? MONTH_DAYS_LEAP_CUMULATIVE
      : MONTH_DAYS_REGULAR_CUMULATIVE;
    var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
    return yday;
  };
  function __localtime_js(time_low, time_high, tmPtr) {
    var time = convertI32PairToI53Checked(time_low, time_high);
    var date = new Date(time * 1e3);
    HEAP32[tmPtr >> 2] = date.getSeconds();
    HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
    HEAP32[(tmPtr + 8) >> 2] = date.getHours();
    HEAP32[(tmPtr + 12) >> 2] = date.getDate();
    HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
    HEAP32[(tmPtr + 20) >> 2] = date.getFullYear() - 1900;
    HEAP32[(tmPtr + 24) >> 2] = date.getDay();
    var yday = ydayFromDate(date) | 0;
    HEAP32[(tmPtr + 28) >> 2] = yday;
    HEAP32[(tmPtr + 36) >> 2] = -(date.getTimezoneOffset() * 60);
    var start = new Date(date.getFullYear(), 0, 1);
    var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
    var winterOffset = start.getTimezoneOffset();
    var dst =
      (summerOffset != winterOffset &&
        date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
    HEAP32[(tmPtr + 32) >> 2] = dst;
  }
  var __mktime_js = function (tmPtr) {
    var ret = (() => {
      var date = new Date(
        HEAP32[(tmPtr + 20) >> 2] + 1900,
        HEAP32[(tmPtr + 16) >> 2],
        HEAP32[(tmPtr + 12) >> 2],
        HEAP32[(tmPtr + 8) >> 2],
        HEAP32[(tmPtr + 4) >> 2],
        HEAP32[tmPtr >> 2],
        0
      );
      var dst = HEAP32[(tmPtr + 32) >> 2];
      var guessedOffset = date.getTimezoneOffset();
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dstOffset = Math.min(winterOffset, summerOffset);
      if (dst < 0) {
        HEAP32[(tmPtr + 32) >> 2] = Number(
          summerOffset != winterOffset && dstOffset == guessedOffset
        );
      } else if (dst > 0 != (dstOffset == guessedOffset)) {
        var nonDstOffset = Math.max(winterOffset, summerOffset);
        var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
        date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
      }
      HEAP32[(tmPtr + 24) >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[(tmPtr + 28) >> 2] = yday;
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[(tmPtr + 4) >> 2] = date.getMinutes();
      HEAP32[(tmPtr + 8) >> 2] = date.getHours();
      HEAP32[(tmPtr + 12) >> 2] = date.getDate();
      HEAP32[(tmPtr + 16) >> 2] = date.getMonth();
      HEAP32[(tmPtr + 20) >> 2] = date.getYear();
      var timeMs = date.getTime();
      if (isNaN(timeMs)) {
        return -1;
      }
      return timeMs / 1e3;
    })();
    return (
      setTempRet0(
        ((tempDouble = ret),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0)
      ),
      ret >>> 0
    );
  };
  function __mmap_js(
    len,
    prot,
    flags,
    fd,
    offset_low,
    offset_high,
    allocated,
    addr
  ) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
    try {
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      var res = FS.mmap(stream, len, offset, prot, flags);
      var ptr = res.ptr;
      HEAP32[allocated >> 2] = res.allocated;
      HEAPU32[addr >> 2] = ptr;
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
    try {
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      if (prot & 2) {
        SYSCALLS.doMsync(addr, stream, len, flags, offset);
      }
      FS.munmap(stream);
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return -e.errno;
    }
  }
  var stringToNewUTF8 = (str) => {
    var size = lengthBytesUTF8(str) + 1;
    var ret = _malloc(size);
    if (ret) stringToUTF8(str, ret, size);
    return ret;
  };
  var __tzset_js = (timezone, daylight, tzname) => {
    var currentYear = new Date().getFullYear();
    var winter = new Date(currentYear, 0, 1);
    var summer = new Date(currentYear, 6, 1);
    var winterOffset = winter.getTimezoneOffset();
    var summerOffset = summer.getTimezoneOffset();
    var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
    HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
    HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
    function extractZone(date) {
      var match = date.toTimeString().match(/\(([A-Za-z ]+)\)$/);
      return match ? match[1] : "GMT";
    }
    var winterName = extractZone(winter);
    var summerName = extractZone(summer);
    var winterNamePtr = stringToNewUTF8(winterName);
    var summerNamePtr = stringToNewUTF8(summerName);
    if (summerOffset < winterOffset) {
      HEAPU32[tzname >> 2] = winterNamePtr;
      HEAPU32[(tzname + 4) >> 2] = summerNamePtr;
    } else {
      HEAPU32[tzname >> 2] = summerNamePtr;
      HEAPU32[(tzname + 4) >> 2] = winterNamePtr;
    }
  };
  var _abort = () => {
    abort("");
  };
  var readEmAsmArgsArray = [];
  var readEmAsmArgs = (sigPtr, buf) => {
    readEmAsmArgsArray.length = 0;
    var ch;
    while ((ch = HEAPU8[sigPtr++])) {
      var wide = ch != 105;
      wide &= ch != 112;
      buf += wide && buf % 8 ? 4 : 0;
      readEmAsmArgsArray.push(
        ch == 112
          ? HEAPU32[buf >> 2]
          : ch == 105
          ? HEAP32[buf >> 2]
          : HEAPF64[buf >> 3]
      );
      buf += wide ? 8 : 4;
    }
    return readEmAsmArgsArray;
  };
  var runEmAsmFunction = (code, sigPtr, argbuf) => {
    var args = readEmAsmArgs(sigPtr, argbuf);
    return ASM_CONSTS[code].apply(null, args);
  };
  var _emscripten_asm_const_int = (code, sigPtr, argbuf) =>
    runEmAsmFunction(code, sigPtr, argbuf);
  var _emscripten_date_now = () => Date.now();
  var getHeapMax = () => 2147483648;
  var _emscripten_get_heap_max = () => getHeapMax();
  var _emscripten_get_now;
  _emscripten_get_now = () => performance.now();
  var _emscripten_memcpy_js = (dest, src, num) =>
    HEAPU8.copyWithin(dest, src, src + num);
  var growMemory = (size) => {
    var b = wasmMemory.buffer;
    var pages = (size - b.byteLength + 65535) / 65536;
    try {
      wasmMemory.grow(pages);
      updateMemoryViews();
      return 1;
    } catch (e) {}
  };
  var _emscripten_resize_heap = (requestedSize) => {
    var oldSize = HEAPU8.length;
    requestedSize >>>= 0;
    var maxHeapSize = getHeapMax();
    if (requestedSize > maxHeapSize) {
      return false;
    }
    var alignUp = (x, multiple) => x + ((multiple - (x % multiple)) % multiple);
    for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
      var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
      overGrownHeapSize = Math.min(
        overGrownHeapSize,
        requestedSize + 100663296
      );
      var newSize = Math.min(
        maxHeapSize,
        alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
      );
      var replacement = growMemory(newSize);
      if (replacement) {
        return true;
      }
    }
    return false;
  };
  var ENV = {};
  var getExecutableName = () => thisProgram || "./this.program";
  var getEnvStrings = () => {
    if (!getEnvStrings.strings) {
      var lang =
        (
          (typeof navigator == "object" &&
            navigator.languages &&
            navigator.languages[0]) ||
          "C"
        ).replace("-", "_") + ".UTF-8";
      var env = {
        USER: "web_user",
        LOGNAME: "web_user",
        PATH: "/",
        PWD: "/",
        HOME: "/home/web_user",
        LANG: lang,
        _: getExecutableName(),
      };
      for (var x in ENV) {
        if (ENV[x] === undefined) delete env[x];
        else env[x] = ENV[x];
      }
      var strings = [];
      for (var x in env) {
        strings.push(`${x}=${env[x]}`);
      }
      getEnvStrings.strings = strings;
    }
    return getEnvStrings.strings;
  };
  var stringToAscii = (str, buffer) => {
    for (var i = 0; i < str.length; ++i) {
      HEAP8[buffer++ >> 0] = str.charCodeAt(i);
    }
    HEAP8[buffer >> 0] = 0;
  };
  var _environ_get = (__environ, environ_buf) => {
    var bufSize = 0;
    getEnvStrings().forEach((string, i) => {
      var ptr = environ_buf + bufSize;
      HEAPU32[(__environ + i * 4) >> 2] = ptr;
      stringToAscii(string, ptr);
      bufSize += string.length + 1;
    });
    return 0;
  };
  var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
    var strings = getEnvStrings();
    HEAPU32[penviron_count >> 2] = strings.length;
    var bufSize = 0;
    strings.forEach((string) => (bufSize += string.length + 1));
    HEAPU32[penviron_buf_size >> 2] = bufSize;
    return 0;
  };
  var runtimeKeepaliveCounter = 0;
  var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
  var _proc_exit = (code) => {
    EXITSTATUS = code;
    if (!keepRuntimeAlive()) {
      Module["onExit"]?.(code);
      ABORT = true;
    }
    quit_(code, new ExitStatus(code));
  };
  var exitJS = (status, implicit) => {
    EXITSTATUS = status;
    _proc_exit(status);
  };
  var _exit = exitJS;
  function _fd_close(fd) {
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.close(stream);
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return e.errno;
    }
  }
  var doReadv = (stream, iov, iovcnt, offset) => {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAPU32[iov >> 2];
      var len = HEAPU32[(iov + 4) >> 2];
      iov += 8;
      var curr = FS.read(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
      if (curr < len) break;
      if (typeof offset !== "undefined") {
        offset += curr;
      }
    }
    return ret;
  };
  function _fd_read(fd, iov, iovcnt, pnum) {
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doReadv(stream, iov, iovcnt);
      HEAPU32[pnum >> 2] = num;
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return e.errno;
    }
  }
  function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
    var offset = convertI32PairToI53Checked(offset_low, offset_high);
    try {
      if (isNaN(offset)) return 61;
      var stream = SYSCALLS.getStreamFromFD(fd);
      FS.llseek(stream, offset, whence);
      (tempI64 = [
        stream.position >>> 0,
        ((tempDouble = stream.position),
        +Math.abs(tempDouble) >= 1
          ? tempDouble > 0
            ? +Math.floor(tempDouble / 4294967296) >>> 0
            : ~~+Math.ceil(
                (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
              ) >>> 0
          : 0),
      ]),
        (HEAP32[newOffset >> 2] = tempI64[0]),
        (HEAP32[(newOffset + 4) >> 2] = tempI64[1]);
      if (stream.getdents && offset === 0 && whence === 0)
        stream.getdents = null;
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return e.errno;
    }
  }
  var doWritev = (stream, iov, iovcnt, offset) => {
    var ret = 0;
    for (var i = 0; i < iovcnt; i++) {
      var ptr = HEAPU32[iov >> 2];
      var len = HEAPU32[(iov + 4) >> 2];
      iov += 8;
      var curr = FS.write(stream, HEAP8, ptr, len, offset);
      if (curr < 0) return -1;
      ret += curr;
      if (typeof offset !== "undefined") {
        offset += curr;
      }
    }
    return ret;
  };
  function _fd_write(fd, iov, iovcnt, pnum) {
    try {
      var stream = SYSCALLS.getStreamFromFD(fd);
      var num = doWritev(stream, iov, iovcnt);
      HEAPU32[pnum >> 2] = num;
      return 0;
    } catch (e) {
      if (typeof FS == "undefined" || !(e.name === "ErrnoError")) throw e;
      return e.errno;
    }
  }
  var arraySum = (array, index) => {
    var sum = 0;
    for (var i = 0; i <= index; sum += array[i++]) {}
    return sum;
  };
  var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  var addDays = (date, days) => {
    var newDate = new Date(date.getTime());
    while (days > 0) {
      var leap = isLeapYear(newDate.getFullYear());
      var currentMonth = newDate.getMonth();
      var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[
        currentMonth
      ];
      if (days > daysInCurrentMonth - newDate.getDate()) {
        days -= daysInCurrentMonth - newDate.getDate() + 1;
        newDate.setDate(1);
        if (currentMonth < 11) {
          newDate.setMonth(currentMonth + 1);
        } else {
          newDate.setMonth(0);
          newDate.setFullYear(newDate.getFullYear() + 1);
        }
      } else {
        newDate.setDate(newDate.getDate() + days);
        return newDate;
      }
    }
    return newDate;
  };
  var writeArrayToMemory = (array, buffer) => {
    HEAP8.set(array, buffer);
  };
  var _strftime = (s, maxsize, format, tm) => {
    var tm_zone = HEAPU32[(tm + 40) >> 2];
    var date = {
      tm_sec: HEAP32[tm >> 2],
      tm_min: HEAP32[(tm + 4) >> 2],
      tm_hour: HEAP32[(tm + 8) >> 2],
      tm_mday: HEAP32[(tm + 12) >> 2],
      tm_mon: HEAP32[(tm + 16) >> 2],
      tm_year: HEAP32[(tm + 20) >> 2],
      tm_wday: HEAP32[(tm + 24) >> 2],
      tm_yday: HEAP32[(tm + 28) >> 2],
      tm_isdst: HEAP32[(tm + 32) >> 2],
      tm_gmtoff: HEAP32[(tm + 36) >> 2],
      tm_zone: tm_zone ? UTF8ToString(tm_zone) : "",
    };
    var pattern = UTF8ToString(format);
    var EXPANSION_RULES_1 = {
      "%c": "%a %b %d %H:%M:%S %Y",
      "%D": "%m/%d/%y",
      "%F": "%Y-%m-%d",
      "%h": "%b",
      "%r": "%I:%M:%S %p",
      "%R": "%H:%M",
      "%T": "%H:%M:%S",
      "%x": "%m/%d/%y",
      "%X": "%H:%M:%S",
      "%Ec": "%c",
      "%EC": "%C",
      "%Ex": "%m/%d/%y",
      "%EX": "%H:%M:%S",
      "%Ey": "%y",
      "%EY": "%Y",
      "%Od": "%d",
      "%Oe": "%e",
      "%OH": "%H",
      "%OI": "%I",
      "%Om": "%m",
      "%OM": "%M",
      "%OS": "%S",
      "%Ou": "%u",
      "%OU": "%U",
      "%OV": "%V",
      "%Ow": "%w",
      "%OW": "%W",
      "%Oy": "%y",
    };
    for (var rule in EXPANSION_RULES_1) {
      pattern = pattern.replace(new RegExp(rule, "g"), EXPANSION_RULES_1[rule]);
    }
    var WEEKDAYS = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    var MONTHS = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    function leadingSomething(value, digits, character) {
      var str = typeof value == "number" ? value.toString() : value || "";
      while (str.length < digits) {
        str = character[0] + str;
      }
      return str;
    }
    function leadingNulls(value, digits) {
      return leadingSomething(value, digits, "0");
    }
    function compareByDay(date1, date2) {
      function sgn(value) {
        return value < 0 ? -1 : value > 0 ? 1 : 0;
      }
      var compare;
      if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
        if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
          compare = sgn(date1.getDate() - date2.getDate());
        }
      }
      return compare;
    }
    function getFirstWeekStartDate(janFourth) {
      switch (janFourth.getDay()) {
        case 0:
          return new Date(janFourth.getFullYear() - 1, 11, 29);
        case 1:
          return janFourth;
        case 2:
          return new Date(janFourth.getFullYear(), 0, 3);
        case 3:
          return new Date(janFourth.getFullYear(), 0, 2);
        case 4:
          return new Date(janFourth.getFullYear(), 0, 1);
        case 5:
          return new Date(janFourth.getFullYear() - 1, 11, 31);
        case 6:
          return new Date(janFourth.getFullYear() - 1, 11, 30);
      }
    }
    function getWeekBasedYear(date) {
      var thisDate = addDays(new Date(date.tm_year + 1900, 0, 1), date.tm_yday);
      var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
      var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
      var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
      var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
      if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
        if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
          return thisDate.getFullYear() + 1;
        }
        return thisDate.getFullYear();
      }
      return thisDate.getFullYear() - 1;
    }
    var EXPANSION_RULES_2 = {
      "%a": (date) => WEEKDAYS[date.tm_wday].substring(0, 3),
      "%A": (date) => WEEKDAYS[date.tm_wday],
      "%b": (date) => MONTHS[date.tm_mon].substring(0, 3),
      "%B": (date) => MONTHS[date.tm_mon],
      "%C": (date) => {
        var year = date.tm_year + 1900;
        return leadingNulls((year / 100) | 0, 2);
      },
      "%d": (date) => leadingNulls(date.tm_mday, 2),
      "%e": (date) => leadingSomething(date.tm_mday, 2, " "),
      "%g": (date) => getWeekBasedYear(date).toString().substring(2),
      "%G": getWeekBasedYear,
      "%H": (date) => leadingNulls(date.tm_hour, 2),
      "%I": (date) => {
        var twelveHour = date.tm_hour;
        if (twelveHour == 0) twelveHour = 12;
        else if (twelveHour > 12) twelveHour -= 12;
        return leadingNulls(twelveHour, 2);
      },
      "%j": (date) =>
        leadingNulls(
          date.tm_mday +
            arraySum(
              isLeapYear(date.tm_year + 1900)
                ? MONTH_DAYS_LEAP
                : MONTH_DAYS_REGULAR,
              date.tm_mon - 1
            ),
          3
        ),
      "%m": (date) => leadingNulls(date.tm_mon + 1, 2),
      "%M": (date) => leadingNulls(date.tm_min, 2),
      "%n": () => "\n",
      "%p": (date) => {
        if (date.tm_hour >= 0 && date.tm_hour < 12) {
          return "AM";
        }
        return "PM";
      },
      "%S": (date) => leadingNulls(date.tm_sec, 2),
      "%t": () => "\t",
      "%u": (date) => date.tm_wday || 7,
      "%U": (date) => {
        var days = date.tm_yday + 7 - date.tm_wday;
        return leadingNulls(Math.floor(days / 7), 2);
      },
      "%V": (date) => {
        var val = Math.floor((date.tm_yday + 7 - ((date.tm_wday + 6) % 7)) / 7);
        if ((date.tm_wday + 371 - date.tm_yday - 2) % 7 <= 2) {
          val++;
        }
        if (!val) {
          val = 52;
          var dec31 = (date.tm_wday + 7 - date.tm_yday - 1) % 7;
          if (
            dec31 == 4 ||
            (dec31 == 5 && isLeapYear((date.tm_year % 400) - 1))
          ) {
            val++;
          }
        } else if (val == 53) {
          var jan1 = (date.tm_wday + 371 - date.tm_yday) % 7;
          if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date.tm_year))) val = 1;
        }
        return leadingNulls(val, 2);
      },
      "%w": (date) => date.tm_wday,
      "%W": (date) => {
        var days = date.tm_yday + 7 - ((date.tm_wday + 6) % 7);
        return leadingNulls(Math.floor(days / 7), 2);
      },
      "%y": (date) => (date.tm_year + 1900).toString().substring(2),
      "%Y": (date) => date.tm_year + 1900,
      "%z": (date) => {
        var off = date.tm_gmtoff;
        var ahead = off >= 0;
        off = Math.abs(off) / 60;
        off = (off / 60) * 100 + (off % 60);
        return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
      },
      "%Z": (date) => date.tm_zone,
      "%%": () => "%",
    };
    pattern = pattern.replace(/%%/g, "\0\0");
    for (var rule in EXPANSION_RULES_2) {
      if (pattern.includes(rule)) {
        pattern = pattern.replace(
          new RegExp(rule, "g"),
          EXPANSION_RULES_2[rule](date)
        );
      }
    }
    pattern = pattern.replace(/\0\0/g, "%");
    var bytes = intArrayFromString(pattern, false);
    if (bytes.length > maxsize) {
      return 0;
    }
    writeArrayToMemory(bytes, s);
    return bytes.length - 1;
  };
  var _strftime_l = (s, maxsize, format, tm, loc) =>
    _strftime(s, maxsize, format, tm);
  var getCFunc = (ident) => {
    var func = Module["_" + ident];
    return func;
  };
  var stringToUTF8OnStack = (str) => {
    var size = lengthBytesUTF8(str) + 1;
    var ret = stackAlloc(size);
    stringToUTF8(str, ret, size);
    return ret;
  };
  var ccall = (ident, returnType, argTypes, args, opts) => {
    var toC = {
      string: (str) => {
        var ret = 0;
        if (str !== null && str !== undefined && str !== 0) {
          ret = stringToUTF8OnStack(str);
        }
        return ret;
      },
      array: (arr) => {
        var ret = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret);
        return ret;
      },
    };
    function convertReturnValue(ret) {
      if (returnType === "string") {
        return UTF8ToString(ret);
      }
      if (returnType === "boolean") return Boolean(ret);
      return ret;
    }
    var func = getCFunc(ident);
    var cArgs = [];
    var stack = 0;
    if (args) {
      for (var i = 0; i < args.length; i++) {
        var converter = toC[argTypes[i]];
        if (converter) {
          if (stack === 0) stack = stackSave();
          cArgs[i] = converter(args[i]);
        } else {
          cArgs[i] = args[i];
        }
      }
    }
    var ret = func.apply(null, cArgs);
    function onDone(ret) {
      if (stack !== 0) stackRestore(stack);
      return convertReturnValue(ret);
    }
    ret = onDone(ret);
    return ret;
  };
  var FSNode = function (parent, name, mode, rdev) {
    if (!parent) {
      parent = this;
    }
    this.parent = parent;
    this.mount = parent.mount;
    this.mounted = null;
    this.id = FS.nextInode++;
    this.name = name;
    this.mode = mode;
    this.node_ops = {};
    this.stream_ops = {};
    this.rdev = rdev;
  };
  var readMode = 292 | 73;
  var writeMode = 146;
  Object.defineProperties(FSNode.prototype, {
    read: {
      get: function () {
        return (this.mode & readMode) === readMode;
      },
      set: function (val) {
        val ? (this.mode |= readMode) : (this.mode &= ~readMode);
      },
    },
    write: {
      get: function () {
        return (this.mode & writeMode) === writeMode;
      },
      set: function (val) {
        val ? (this.mode |= writeMode) : (this.mode &= ~writeMode);
      },
    },
    isFolder: {
      get: function () {
        return FS.isDir(this.mode);
      },
    },
    isDevice: {
      get: function () {
        return FS.isChrdev(this.mode);
      },
    },
  });
  FS.FSNode = FSNode;
  FS.createPreloadedFile = FS_createPreloadedFile;
  FS.staticInit();
  Module["FS_createPath"] = FS.createPath;
  Module["FS_createDataFile"] = FS.createDataFile;
  Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
  Module["FS_unlink"] = FS.unlink;
  Module["FS_createLazyFile"] = FS.createLazyFile;
  Module["FS_createDevice"] = FS.createDevice;
  var wasmImports = {
    a: ___cxa_throw,
    e: ___syscall_fcntl64,
    G: ___syscall_fstat64,
    y: ___syscall_getcwd,
    B: ___syscall_getdents64,
    I: ___syscall_ioctl,
    D: ___syscall_lstat64,
    C: ___syscall_mkdirat,
    E: ___syscall_newfstatat,
    k: ___syscall_openat,
    x: ___syscall_readlinkat,
    z: ___syscall_rmdir,
    F: ___syscall_stat64,
    A: ___syscall_unlinkat,
    J: __emscripten_get_now_is_monotonic,
    r: __gmtime_js,
    s: __localtime_js,
    t: __mktime_js,
    p: __mmap_js,
    q: __munmap_js,
    H: __tzset_js,
    f: _abort,
    w: _emscripten_asm_const_int,
    i: _emscripten_date_now,
    l: _emscripten_get_heap_max,
    c: _emscripten_get_now,
    K: _emscripten_memcpy_js,
    o: _emscripten_resize_heap,
    m: _environ_get,
    n: _environ_sizes_get,
    b: _exit,
    g: _fd_close,
    j: _fd_read,
    u: _fd_seek,
    h: _fd_write,
    v: _strftime,
    d: _strftime_l,
  };
  var wasmExports = createWasm();
  var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["M"])();
  var _MyPrint = (Module["_MyPrint"] = (a0) =>
    (_MyPrint = Module["_MyPrint"] = wasmExports["N"])(a0));
  var _CopyHeap = (Module["_CopyHeap"] = (a0, a1, a2) =>
    (_CopyHeap = Module["_CopyHeap"] = wasmExports["O"])(a0, a1, a2));
  Module["__CopyHeap"] = _CopyHeap;
  var _SherpaOnnxCreateOfflineTts = (Module["_SherpaOnnxCreateOfflineTts"] = (
    a0
  ) =>
    (_SherpaOnnxCreateOfflineTts = Module["_SherpaOnnxCreateOfflineTts"] =
      wasmExports["P"])(a0));
  Module["__SherpaOnnxCreateOfflineTts"] = _SherpaOnnxCreateOfflineTts;
  var _SherpaOnnxDestroyOfflineTts = (Module["_SherpaOnnxDestroyOfflineTts"] = (
    a0
  ) =>
    (_SherpaOnnxDestroyOfflineTts = Module["_SherpaOnnxDestroyOfflineTts"] =
      wasmExports["Q"])(a0));
  Module["__SherpaOnnxDestroyOfflineTts"] = _SherpaOnnxDestroyOfflineTts;
  var _SherpaOnnxOfflineTtsSampleRate = (Module[
    "_SherpaOnnxOfflineTtsSampleRate"
  ] = (a0) =>
    (_SherpaOnnxOfflineTtsSampleRate = Module[
      "_SherpaOnnxOfflineTtsSampleRate"
    ] =
      wasmExports["R"])(a0));
  Module["__SherpaOnnxOfflineTtsSampleRate"] = _SherpaOnnxOfflineTtsSampleRate;
  var _SherpaOnnxOfflineTtsNumSpeakers = (Module[
    "_SherpaOnnxOfflineTtsNumSpeakers"
  ] = (a0) =>
    (_SherpaOnnxOfflineTtsNumSpeakers = Module[
      "_SherpaOnnxOfflineTtsNumSpeakers"
    ] =
      wasmExports["S"])(a0));
  Module["__SherpaOnnxOfflineTtsNumSpeakers"] =
    _SherpaOnnxOfflineTtsNumSpeakers;
  var _SherpaOnnxOfflineTtsGenerate = (Module["_SherpaOnnxOfflineTtsGenerate"] =
    (a0, a1, a2, a3) =>
      (_SherpaOnnxOfflineTtsGenerate = Module["_SherpaOnnxOfflineTtsGenerate"] =
        wasmExports["T"])(a0, a1, a2, a3));
  Module["__SherpaOnnxOfflineTtsGenerate"] = _SherpaOnnxOfflineTtsGenerate;
  var _SherpaOnnxOfflineTtsGenerateWithCallback = (Module[
    "_SherpaOnnxOfflineTtsGenerateWithCallback"
  ] = (a0, a1, a2, a3, a4) =>
    (_SherpaOnnxOfflineTtsGenerateWithCallback = Module[
      "_SherpaOnnxOfflineTtsGenerateWithCallback"
    ] =
      wasmExports["U"])(a0, a1, a2, a3, a4));
  var _SherpaOnnxDestroyOfflineTtsGeneratedAudio = (Module[
    "_SherpaOnnxDestroyOfflineTtsGeneratedAudio"
  ] = (a0) =>
    (_SherpaOnnxDestroyOfflineTtsGeneratedAudio = Module[
      "_SherpaOnnxDestroyOfflineTtsGeneratedAudio"
    ] =
      wasmExports["V"])(a0));
  Module["__SherpaOnnxDestroyOfflineTtsGeneratedAudio"] =
    _SherpaOnnxDestroyOfflineTtsGeneratedAudio;
  var _SherpaOnnxWriteWave = (Module["_SherpaOnnxWriteWave"] = (
    a0,
    a1,
    a2,
    a3
  ) =>
    (_SherpaOnnxWriteWave = Module["_SherpaOnnxWriteWave"] = wasmExports["W"])(
      a0,
      a1,
      a2,
      a3
    ));
  var _malloc = (Module["_malloc"] = (a0) =>
    (_malloc = Module["_malloc"] = wasmExports["Y"])(a0));
  Module["__malloc"] = _malloc;
  var _free = (Module["_free"] = (a0) =>
    (_free = Module["_free"] = wasmExports["Z"])(a0));
  Module["__free"] = _free;
  var _emscripten_builtin_memalign = (a0, a1) =>
    (_emscripten_builtin_memalign = wasmExports["_"])(a0, a1);
  var setTempRet0 = (a0) => (setTempRet0 = wasmExports["$"])(a0);
  var stackSave = () => (stackSave = wasmExports["aa"])();
  var stackRestore = (a0) => (stackRestore = wasmExports["ba"])(a0);
  var stackAlloc = (a0) => (stackAlloc = wasmExports["ca"])(a0);
  var ___cxa_is_pointer_type = (a0) =>
    (___cxa_is_pointer_type = wasmExports["da"])(a0);
  Module["addRunDependency"] = addRunDependency;
  Module["removeRunDependency"] = removeRunDependency;
  Module["FS_createPath"] = FS.createPath;
  Module["FS_createLazyFile"] = FS.createLazyFile;
  Module["FS_createDevice"] = FS.createDevice;
  Module["ccall"] = ccall;
  Module["setValue"] = setValue;
  Module["getValue"] = getValue;
  Module["stringToUTF8"] = stringToUTF8;
  Module["FS_createPreloadedFile"] = FS.createPreloadedFile;
  Module["FS_createDataFile"] = FS.createDataFile;
  Module["FS_unlink"] = FS.unlink;
  var calledRun;
  dependenciesFulfilled = function runCaller() {
    if (!calledRun) run();
    if (!calledRun) dependenciesFulfilled = runCaller;
  };
  function run() {
    if (runDependencies > 0) {
      return;
    }
    preRun();
    if (runDependencies > 0) {
      return;
    }
    function doRun() {
      if (calledRun) return;
      calledRun = true;
      Module["calledRun"] = true;
      if (ABORT) return;
      initRuntime();
      if (Module["onRuntimeInitialized"])
        Module["onRuntimeInitialized"](Module);
      postRun();
    }
    if (Module["setStatus"]) {
      Module["setStatus"]("Running...");
      setTimeout(function () {
        setTimeout(function () {
          Module["setStatus"]("");
        }, 1);
        doRun();
      }, 1);
    } else {
      doRun();
    }
  }
  if (Module["preInit"]) {
    if (typeof Module["preInit"] == "function")
      Module["preInit"] = [Module["preInit"]];
    while (Module["preInit"].length > 0) {
      Module["preInit"].pop()();
    }
  }
  run();
}
