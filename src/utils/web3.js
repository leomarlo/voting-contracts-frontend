"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.getPlaygroundInstancesFromEvents = exports.getVotingInstanceExternalInfo = exports.getPlaygroundContract = exports.getPlaygroundAddress = exports.getContractAddress = exports.getGeneralVotingInterface = exports.getPlaygroundABI = exports.getABI = exports.URL_PLAYGROUND_ABI = void 0;
var ethers_1 = require("ethers");
var chains_1 = require("../utils/chains");
var deploymentInfo_json_1 = require("../deployment/deploymentInfo.json");
var axios_1 = require("axios");
var GeneralVotingContract_1 = require("../abis/GeneralVotingContract");
var PROTOCOL = "https://";
var BASE_URL = "raw.githubusercontent.com/leomarlo/voting-registry-contracts";
var BRANCH = "development";
var URL_PLAYGROUND_ABI = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/examples/playground/Playground.sol/VotingPlayground.json";
exports.URL_PLAYGROUND_ABI = URL_PLAYGROUND_ABI;
var URL_DEPLOYMENT_INFO = PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "scripts/verification/deploymentArgs/deploymentInfo.json";
var URL_VOTING_INTERFACES = {
    URL_IVOTINGCONTRACT: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/votingContractStandard/IVotingContract.sol/IVotingContract.json",
    URL_IGETCALLBACKDATA: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetCallbackData.sol/IGetCallbackData.json",
    URL_IGETCALLBACKHASH: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetCallbackHash.sol/IGetCallbackHash.json",
    URL_IGETDEADLINE: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetDeadline.sol/IGetDeadline.json",
    URL_IGETQUROUM: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetQuorum.sol/IGetQuorum.json",
    URL_IGETTOKEN: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetToken.sol/IGetToken.json",
    URL_IHASALREADYVOTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IHasAlreadyVoted.sol/IHasAlreadyVoted.json",
    URL_IIMPLEMENTRESULT: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IImplementResult.sol/IImplementResult.json",
    URL_IIMPLEMENTINGPERMITTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IImplementingPermitted.sol/IImplementingPermitted.json",
    URL_ISTATUSGETTER: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IStatusGetter.sol/IStatusGetter.json",
    URL_IGETDOUBLEVOTINGGUARD: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IGetDoubleVotingGuard.sol/IGetDoubleVotingGuard.json",
    URL_ITARGETGETTER: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/ITargetGetter.sol/ITargetGetter.json",
    URL_IVOTINGPERMITTED: PROTOCOL + BASE_URL + "/" + BRANCH + "/" + "artifacts/src/extensions/interfaces/IVotingPermitted.sol/IVotingPermitted.json"
};
var TOKEN_MINIMAL_ABI = [
    "function name() external view returns (string)",
    "function symbol() external view returns (string)"
];
var TOKEN_WITH_ERC165_INTERFACE = TOKEN_MINIMAL_ABI.concat([
    "function supportsInterface(bytes4) external view returns (bool)"
]);
var ERC165_ID = "0x01ffc9a7";
var ERC721_ID = "0x80ac58cd";
var ERC1155_ID = "0xd9b67a26";
var getABI = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1["default"].get(url)];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.data.abi];
        }
    });
}); };
exports.getABI = getABI;
var getDeploymentInfo = function () { return __awaiter(void 0, void 0, void 0, function () {
    var res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios_1["default"].get(URL_DEPLOYMENT_INFO)];
            case 1:
                res = _a.sent();
                return [2 /*return*/, res.data];
        }
    });
}); };
var getPlaygroundABI = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('inside getPlaygroundABI');
                return [4 /*yield*/, getABI(URL_PLAYGROUND_ABI)];
            case 1: 
            // return []
            return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getPlaygroundABI = getPlaygroundABI;
var getEthersInterface = function (url) { return __awaiter(void 0, void 0, void 0, function () {
    var abi;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getABI(url)];
            case 1:
                abi = _a.sent();
                return [2 /*return*/, new ethers_1.ethers.utils.Interface(abi)];
        }
    });
}); };
var getGeneralVotingInterface = function (fromHttpRequest) { return __awaiter(void 0, void 0, void 0, function () {
    var res, interfaceURLs, i, interfaceURL, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!fromHttpRequest) return [3 /*break*/, 5];
                res = [];
                interfaceURLs = Object.values(URL_VOTING_INTERFACES);
                i = 0;
                _c.label = 1;
            case 1:
                if (!(i < interfaceURLs.length)) return [3 /*break*/, 4];
                interfaceURL = interfaceURLs[i];
                _b = (_a = res).concat;
                return [4 /*yield*/, getABI(interfaceURL)];
            case 2:
                res = _b.apply(_a, [_c.sent()]);
                _c.label = 3;
            case 3:
                i++;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/, res];
            case 5: return [2 /*return*/, GeneralVotingContract_1["default"]];
        }
    });
}); };
exports.getGeneralVotingInterface = getGeneralVotingInterface;
var getPlaygroundInterface = function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getEthersInterface(URL_PLAYGROUND_ABI)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var getContract = function (chainId, contractName, abi) { return __awaiter(void 0, void 0, void 0, function () {
    var address;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getContractAddress(chainId, contractName)];
            case 1:
                address = _a.sent();
                return [2 /*return*/, new ethers_1.ethers.Contract(address, abi)];
        }
    });
}); };
var getPlaygroundContract = function (chainId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                console.log('inside getPlaygroundContract');
                _a = getContract;
                _b = [chainId, "VotingPlayground"];
                return [4 /*yield*/, getPlaygroundABI()];
            case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([_c.sent()]))];
        }
    });
}); };
exports.getPlaygroundContract = getPlaygroundContract;
var getContractAddress = function (chainId, contractName) { return __awaiter(void 0, void 0, void 0, function () {
    var flag, networkName, info, _a, deploymentInfoNetwork;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                flag = false;
                networkName = chains_1.reverseResolveChainId[chainId];
                if (!flag) return [3 /*break*/, 2];
                return [4 /*yield*/, getDeploymentInfo()];
            case 1:
                _a = _b.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = deploymentInfo_json_1["default"];
                _b.label = 3;
            case 3:
                info = _a;
                deploymentInfoNetwork = info[networkName];
                return [2 /*return*/, deploymentInfoNetwork[contractName].address];
        }
    });
}); };
exports.getContractAddress = getContractAddress;
var getPlaygroundAddress = function (chainId) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, getContractAddress(chainId, "VotingPlayground")];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getPlaygroundAddress = getPlaygroundAddress;
var DoubleVotingGuard;
(function (DoubleVotingGuard) {
    DoubleVotingGuard[DoubleVotingGuard["none"] = 0] = "none";
    DoubleVotingGuard[DoubleVotingGuard["onSender"] = 1] = "onSender";
    DoubleVotingGuard[DoubleVotingGuard["onVotingData"] = 2] = "onVotingData";
})(DoubleVotingGuard || (DoubleVotingGuard = {}));
var getPlaygroundInstancesFromEvents = function (playgroundContract) { return __awaiter(void 0, void 0, void 0, function () {
    var flt, events;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                flt = playgroundContract.filters.VotingInstanceStarted(null, null, null);
                return [4 /*yield*/, playgroundContract.queryFilter(flt)];
            case 1:
                events = _a.sent();
                return [2 /*return*/, events.map(function (e) {
                        var _a, _b, _c;
                        var targetId = (_a = e.args) === null || _a === void 0 ? void 0 : _a.target;
                        var target = {
                            id: targetId,
                            isFunction: targetId.length < (2 + 2 * 4)
                        };
                        if (target.isFunction) {
                            target.name = playgroundContract.interface.getFunction(targetId).name;
                        }
                        var instanceInternalInfo = { index: (_b = e.args) === null || _b === void 0 ? void 0 : _b.index, sender: (_c = e.args) === null || _c === void 0 ? void 0 : _c.sender, target: target };
                        return instanceInternalInfo;
                    })];
        }
    });
}); };
exports.getPlaygroundInstancesFromEvents = getPlaygroundInstancesFromEvents;
var getVotingInstanceExternalInfo = function (signer, votingContractAddress, votingContractABI, identifier) { return __awaiter(void 0, void 0, void 0, function () {
    var votingInstanceExternalInfo, message, votingContract, deadlineInSeconds, currentTimeInSeconds, err_1, status_1, err_2, tokenInfo, tokenAddress, tokenInterface, name_1, symbol, interfaces, supports_erc165, supports_erc721, supports_erc1155, err_3, err_4, err_5, doubleVotingType, err_6, _a, value, inUnitsOf, err_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('identifier', identifier);
                votingInstanceExternalInfo = {};
                message = '';
                votingContract = new ethers_1.ethers.Contract(votingContractAddress, votingContractABI, signer);
                // save contract instance into external info object
                votingInstanceExternalInfo.votingContract = votingContract;
                // identifier
                votingInstanceExternalInfo.identifier = identifier;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, votingContract.getDeadline(identifier)];
            case 2:
                deadlineInSeconds = (_b.sent()).toNumber();
                votingInstanceExternalInfo.deadline = (new Date(deadlineInSeconds * 1000)).toLocaleString();
                currentTimeInSeconds = Math.floor(Date.now() / 1000);
                votingInstanceExternalInfo.ttl = Math.max(deadlineInSeconds - currentTimeInSeconds, 0);
                return [3 /*break*/, 4];
            case 3:
                err_1 = _b.sent();
                console.log('getDeadline', err_1);
                message += 'No getDeadline method found!\n';
                return [3 /*break*/, 4];
            case 4:
                _b.trys.push([4, 6, , 7]);
                return [4 /*yield*/, votingContract.getStatus(identifier)];
            case 5:
                status_1 = (_b.sent());
                votingInstanceExternalInfo.status = status_1.toString();
                return [3 /*break*/, 7];
            case 6:
                err_2 = _b.sent();
                console.log('getStatus', err_2);
                message += 'No getStatus method found!\n';
                return [3 /*break*/, 7];
            case 7:
                _b.trys.push([7, 20, , 21]);
                tokenInfo = {};
                return [4 /*yield*/, votingContract.getToken(identifier)];
            case 8:
                tokenAddress = _b.sent();
                tokenInfo.address = tokenAddress;
                _b.label = 9;
            case 9:
                _b.trys.push([9, 18, , 19]);
                tokenInterface = new ethers_1.ethers.Contract(tokenAddress, TOKEN_WITH_ERC165_INTERFACE, signer);
                return [4 /*yield*/, tokenInterface.name()];
            case 10:
                name_1 = (_b.sent());
                return [4 /*yield*/, tokenInterface.symbol()];
            case 11:
                symbol = (_b.sent());
                tokenInfo.name = name_1;
                tokenInfo.symbol = symbol;
                interfaces = {};
                _b.label = 12;
            case 12:
                _b.trys.push([12, 16, , 17]);
                return [4 /*yield*/, tokenInterface.supportsInterface(ERC165_ID)];
            case 13:
                supports_erc165 = _b.sent();
                return [4 /*yield*/, tokenInterface.supportsInterface(ERC721_ID)];
            case 14:
                supports_erc721 = _b.sent();
                return [4 /*yield*/, tokenInterface.supportsInterface(ERC1155_ID)];
            case 15:
                supports_erc1155 = _b.sent();
                interfaces = {
                    erc165: supports_erc165,
                    erc721: supports_erc721,
                    erc1155: supports_erc1155
                };
                tokenInfo.interfaces = interfaces;
                return [3 /*break*/, 17];
            case 16:
                err_3 = _b.sent();
                console.log('supportsInterface', err_3);
                message += 'No supportsInterface found method found!\n';
                return [3 /*break*/, 17];
            case 17: return [3 /*break*/, 19];
            case 18:
                err_4 = _b.sent();
                console.log('token name', err_4);
                message += 'No token name or symbol found method found!\n';
                return [3 /*break*/, 19];
            case 19:
                votingInstanceExternalInfo.token = tokenInfo;
                return [3 /*break*/, 21];
            case 20:
                err_5 = _b.sent();
                console.log('getToken', err_5);
                message += 'No getToken method found!\n';
                return [3 /*break*/, 21];
            case 21:
                _b.trys.push([21, 23, , 24]);
                return [4 /*yield*/, votingContract.getDoubleVotingGuard(identifier)];
            case 22:
                doubleVotingType = (_b.sent());
                votingInstanceExternalInfo.doubleVotingGuard = doubleVotingType;
                return [3 /*break*/, 24];
            case 23:
                err_6 = _b.sent();
                console.log('getDoubleVotingGuard', err_6);
                message += 'No getDoubleVotingGuard method found!\n';
                return [3 /*break*/, 24];
            case 24:
                _b.trys.push([24, 26, , 27]);
                return [4 /*yield*/, votingContract.getQuorum(identifier)];
            case 25:
                _a = _b.sent(), value = _a[0], inUnitsOf = _a[1];
                votingInstanceExternalInfo.quorum = { value: value.toString(), inUnitsOf: inUnitsOf.toString() };
                return [3 /*break*/, 27];
            case 26:
                err_7 = _b.sent();
                console.log('getDoubleVotingGuard', err_7);
                message += 'No getQuorum method found!\n';
                return [3 /*break*/, 27];
            case 27:
                console.log(message);
                return [2 /*return*/, votingInstanceExternalInfo];
        }
    });
}); };
exports.getVotingInstanceExternalInfo = getVotingInstanceExternalInfo;
