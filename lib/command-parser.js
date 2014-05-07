(function() {
  var extend = function (destination, source) {
    if (!destination || !source) return destination;
    for (var key in source) {
      if (destination[key] !== source[key])
        destination[key] = source[key];
    }
    return destination;
  };
  
  var find = function (root, objectName) {
    var parts = objectName.split('.'),
        part;
    
    while (part = parts.shift()) {
      root = root[part];
      if (root === undefined)
        throw new Error('Cannot find object named ' + objectName);
    }
    return root;
  };
  
  var formatError = function (error) {
    var lines  = error.input.split(/\n/g),
        lineNo = 0,
        offset = 0;
    
    while (offset < error.offset + 1) {
      offset += lines[lineNo].length + 1;
      lineNo += 1;
    }
    var message = 'Line ' + lineNo + ': expected ' + error.expected + '\n',
        line    = lines[lineNo - 1];
    
    message += line + '\n';
    offset  -= line.length + 1;
    
    while (offset < error.offset) {
      message += ' ';
      offset  += 1;
    }
    return message + '^';
  };
  
  var Grammar = {
    __consume__root: function(input) {
      var address0 = null, index0 = this._offset;
      this._nodeCache["root"] = this._nodeCache["root"] || {};
      var cached = this._nodeCache["root"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var remaining0 = 1, index2 = this._offset, elements1 = [], text1 = "", address2 = true;
      while (address2) {
        var slice0 = null;
        if (this._input.length > this._offset) {
          slice0 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice0 = null;
        }
        if (slice0 && /^[^\s]/.test(slice0)) {
          var klass0 = this.constructor.SyntaxNode;
          var type0 = null;
          address2 = new klass0(slice0, this._offset, []);
          if (typeof type0 === "object") {
            extend(address2, type0);
          }
          this._offset += 1;
        } else {
          address2 = null;
          var slice1 = null;
          if (this._input.length > this._offset) {
            slice1 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice1 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[^\\s]"};
          }
        }
        if (address2) {
          elements1.push(address2);
          text1 += address2.textValue;
          remaining0 -= 1;
        }
      }
      if (remaining0 <= 0) {
        this._offset = index2;
        var klass1 = this.constructor.SyntaxNode;
        var type1 = null;
        address1 = new klass1(text1, this._offset, elements1);
        if (typeof type1 === "object") {
          extend(address1, type1);
        }
        this._offset += text1.length;
      } else {
        address1 = null;
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address3 = null;
        var remaining1 = 0, index3 = this._offset, elements2 = [], text2 = "", address4 = true;
        while (address4) {
          var slice2 = null;
          if (this._input.length > this._offset) {
            slice2 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice2 = null;
          }
          if (slice2 && /^[\s]/.test(slice2)) {
            var klass2 = this.constructor.SyntaxNode;
            var type2 = null;
            address4 = new klass2(slice2, this._offset, []);
            if (typeof type2 === "object") {
              extend(address4, type2);
            }
            this._offset += 1;
          } else {
            address4 = null;
            var slice3 = null;
            if (this._input.length > this._offset) {
              slice3 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice3 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\\s]"};
            }
          }
          if (address4) {
            elements2.push(address4);
            text2 += address4.textValue;
            remaining1 -= 1;
          }
        }
        if (remaining1 <= 0) {
          this._offset = index3;
          var klass3 = this.constructor.SyntaxNode;
          var type3 = null;
          address3 = new klass3(text2, this._offset, elements2);
          if (typeof type3 === "object") {
            extend(address3, type3);
          }
          this._offset += text2.length;
        } else {
          address3 = null;
        }
        if (address3) {
          elements0.push(address3);
          text0 += address3.textValue;
          var address5 = null;
          var remaining2 = 0, index4 = this._offset, elements3 = [], text3 = "", address6 = true;
          while (address6) {
            address6 = this.__consume__argument();
            if (address6) {
              elements3.push(address6);
              text3 += address6.textValue;
              remaining2 -= 1;
            }
          }
          if (remaining2 <= 0) {
            this._offset = index4;
            var klass4 = this.constructor.SyntaxNode;
            var type4 = null;
            address5 = new klass4(text3, this._offset, elements3);
            if (typeof type4 === "object") {
              extend(address5, type4);
            }
            this._offset += text3.length;
          } else {
            address5 = null;
          }
          if (address5) {
            elements0.push(address5);
            text0 += address5.textValue;
          } else {
            elements0 = null;
            this._offset = index1;
          }
        } else {
          elements0 = null;
          this._offset = index1;
        }
      } else {
        elements0 = null;
        this._offset = index1;
      }
      if (elements0) {
        this._offset = index1;
        var klass5 = this.constructor.SyntaxNode;
        var type5 = null;
        address0 = new klass5(text0, this._offset, elements0, labelled0);
        if (typeof type5 === "object") {
          extend(address0, type5);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      return this._nodeCache["root"][index0] = address0;
    },
    __consume__argument: function(input) {
      var address0 = null, index0 = this._offset;
      this._nodeCache["argument"] = this._nodeCache["argument"] || {};
      var cached = this._nodeCache["argument"][index0];
      if (cached) {
        this._offset += cached.textValue.length;
        return cached;
      }
      var index1 = this._offset;
      var index2 = this._offset, elements0 = [], labelled0 = {}, text0 = "";
      var address1 = null;
      var slice0 = null;
      if (this._input.length > this._offset) {
        slice0 = this._input.substring(this._offset, this._offset + 1);
      } else {
        slice0 = null;
      }
      if (slice0 && /^[']/.test(slice0)) {
        var klass0 = this.constructor.SyntaxNode;
        var type0 = null;
        address1 = new klass0(slice0, this._offset, []);
        if (typeof type0 === "object") {
          extend(address1, type0);
        }
        this._offset += 1;
      } else {
        address1 = null;
        var slice1 = null;
        if (this._input.length > this._offset) {
          slice1 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice1 = null;
        }
        if (!this.error || this.error.offset <= this._offset) {
          this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[']"};
        }
      }
      if (address1) {
        elements0.push(address1);
        text0 += address1.textValue;
        var address2 = null;
        var remaining0 = 1, index3 = this._offset, elements1 = [], text1 = "", address3 = true;
        while (address3) {
          var index4 = this._offset, elements2 = [], labelled1 = {}, text2 = "";
          var address4 = null;
          var index5 = this._offset;
          var slice2 = null;
          if (this._input.length > this._offset) {
            slice2 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice2 = null;
          }
          if (slice2 && /^[']/.test(slice2)) {
            var klass1 = this.constructor.SyntaxNode;
            var type1 = null;
            address4 = new klass1(slice2, this._offset, []);
            if (typeof type1 === "object") {
              extend(address4, type1);
            }
            this._offset += 1;
          } else {
            address4 = null;
            var slice3 = null;
            if (this._input.length > this._offset) {
              slice3 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice3 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[']"};
            }
          }
          this._offset = index5;
          if (!(address4)) {
            var klass2 = this.constructor.SyntaxNode;
            var type2 = null;
            address4 = new klass2("", this._offset, []);
            if (typeof type2 === "object") {
              extend(address4, type2);
            }
            this._offset += 0;
          } else {
            address4 = null;
          }
          if (address4) {
            elements2.push(address4);
            text2 += address4.textValue;
            var address5 = null;
            var slice4 = null;
            if (this._input.length > this._offset) {
              slice4 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice4 = null;
            }
            var temp0 = slice4;
            if (temp0 === null) {
              address5 = null;
              var slice5 = null;
              if (this._input.length > this._offset) {
                slice5 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice5 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "<any char>"};
              }
            } else {
              var klass3 = this.constructor.SyntaxNode;
              var type3 = null;
              address5 = new klass3(temp0, this._offset, []);
              if (typeof type3 === "object") {
                extend(address5, type3);
              }
              this._offset += 1;
            }
            if (address5) {
              elements2.push(address5);
              text2 += address5.textValue;
            } else {
              elements2 = null;
              this._offset = index4;
            }
          } else {
            elements2 = null;
            this._offset = index4;
          }
          if (elements2) {
            this._offset = index4;
            var klass4 = this.constructor.SyntaxNode;
            var type4 = null;
            address3 = new klass4(text2, this._offset, elements2, labelled1);
            if (typeof type4 === "object") {
              extend(address3, type4);
            }
            this._offset += text2.length;
          } else {
            address3 = null;
          }
          if (address3) {
            elements1.push(address3);
            text1 += address3.textValue;
            remaining0 -= 1;
          }
        }
        if (remaining0 <= 0) {
          this._offset = index3;
          var klass5 = this.constructor.SyntaxNode;
          var type5 = null;
          address2 = new klass5(text1, this._offset, elements1);
          if (typeof type5 === "object") {
            extend(address2, type5);
          }
          this._offset += text1.length;
        } else {
          address2 = null;
        }
        if (address2) {
          elements0.push(address2);
          text0 += address2.textValue;
          labelled0.arg = address2;
          var address6 = null;
          var slice6 = null;
          if (this._input.length > this._offset) {
            slice6 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice6 = null;
          }
          if (slice6 && /^[']/.test(slice6)) {
            var klass6 = this.constructor.SyntaxNode;
            var type6 = null;
            address6 = new klass6(slice6, this._offset, []);
            if (typeof type6 === "object") {
              extend(address6, type6);
            }
            this._offset += 1;
          } else {
            address6 = null;
            var slice7 = null;
            if (this._input.length > this._offset) {
              slice7 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice7 = null;
            }
            if (!this.error || this.error.offset <= this._offset) {
              this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[']"};
            }
          }
          if (address6) {
            elements0.push(address6);
            text0 += address6.textValue;
            var address7 = null;
            var remaining1 = 0, index6 = this._offset, elements3 = [], text3 = "", address8 = true;
            while (address8) {
              var slice8 = null;
              if (this._input.length > this._offset) {
                slice8 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice8 = null;
              }
              if (slice8 && /^[\s]/.test(slice8)) {
                var klass7 = this.constructor.SyntaxNode;
                var type7 = null;
                address8 = new klass7(slice8, this._offset, []);
                if (typeof type7 === "object") {
                  extend(address8, type7);
                }
                this._offset += 1;
              } else {
                address8 = null;
                var slice9 = null;
                if (this._input.length > this._offset) {
                  slice9 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice9 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\\s]"};
                }
              }
              if (address8) {
                elements3.push(address8);
                text3 += address8.textValue;
                remaining1 -= 1;
              }
            }
            if (remaining1 <= 0) {
              this._offset = index6;
              var klass8 = this.constructor.SyntaxNode;
              var type8 = null;
              address7 = new klass8(text3, this._offset, elements3);
              if (typeof type8 === "object") {
                extend(address7, type8);
              }
              this._offset += text3.length;
            } else {
              address7 = null;
            }
            if (address7) {
              elements0.push(address7);
              text0 += address7.textValue;
            } else {
              elements0 = null;
              this._offset = index2;
            }
          } else {
            elements0 = null;
            this._offset = index2;
          }
        } else {
          elements0 = null;
          this._offset = index2;
        }
      } else {
        elements0 = null;
        this._offset = index2;
      }
      if (elements0) {
        this._offset = index2;
        var klass9 = this.constructor.SyntaxNode;
        var type9 = null;
        address0 = new klass9(text0, this._offset, elements0, labelled0);
        if (typeof type9 === "object") {
          extend(address0, type9);
        }
        this._offset += text0.length;
      } else {
        address0 = null;
      }
      if (address0) {
      } else {
        this._offset = index1;
        var index7 = this._offset, elements4 = [], labelled2 = {}, text4 = "";
        var address9 = null;
        var slice10 = null;
        if (this._input.length > this._offset) {
          slice10 = this._input.substring(this._offset, this._offset + 1);
        } else {
          slice10 = null;
        }
        if (slice10 && /^["]/.test(slice10)) {
          var klass10 = this.constructor.SyntaxNode;
          var type10 = null;
          address9 = new klass10(slice10, this._offset, []);
          if (typeof type10 === "object") {
            extend(address9, type10);
          }
          this._offset += 1;
        } else {
          address9 = null;
          var slice11 = null;
          if (this._input.length > this._offset) {
            slice11 = this._input.substring(this._offset, this._offset + 1);
          } else {
            slice11 = null;
          }
          if (!this.error || this.error.offset <= this._offset) {
            this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\"]"};
          }
        }
        if (address9) {
          elements4.push(address9);
          text4 += address9.textValue;
          var address10 = null;
          var remaining2 = 1, index8 = this._offset, elements5 = [], text5 = "", address11 = true;
          while (address11) {
            var index9 = this._offset, elements6 = [], labelled3 = {}, text6 = "";
            var address12 = null;
            var index10 = this._offset;
            var slice12 = null;
            if (this._input.length > this._offset) {
              slice12 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice12 = null;
            }
            if (slice12 && /^["]/.test(slice12)) {
              var klass11 = this.constructor.SyntaxNode;
              var type11 = null;
              address12 = new klass11(slice12, this._offset, []);
              if (typeof type11 === "object") {
                extend(address12, type11);
              }
              this._offset += 1;
            } else {
              address12 = null;
              var slice13 = null;
              if (this._input.length > this._offset) {
                slice13 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice13 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\"]"};
              }
            }
            this._offset = index10;
            if (!(address12)) {
              var klass12 = this.constructor.SyntaxNode;
              var type12 = null;
              address12 = new klass12("", this._offset, []);
              if (typeof type12 === "object") {
                extend(address12, type12);
              }
              this._offset += 0;
            } else {
              address12 = null;
            }
            if (address12) {
              elements6.push(address12);
              text6 += address12.textValue;
              var address13 = null;
              var slice14 = null;
              if (this._input.length > this._offset) {
                slice14 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice14 = null;
              }
              var temp1 = slice14;
              if (temp1 === null) {
                address13 = null;
                var slice15 = null;
                if (this._input.length > this._offset) {
                  slice15 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice15 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "<any char>"};
                }
              } else {
                var klass13 = this.constructor.SyntaxNode;
                var type13 = null;
                address13 = new klass13(temp1, this._offset, []);
                if (typeof type13 === "object") {
                  extend(address13, type13);
                }
                this._offset += 1;
              }
              if (address13) {
                elements6.push(address13);
                text6 += address13.textValue;
              } else {
                elements6 = null;
                this._offset = index9;
              }
            } else {
              elements6 = null;
              this._offset = index9;
            }
            if (elements6) {
              this._offset = index9;
              var klass14 = this.constructor.SyntaxNode;
              var type14 = null;
              address11 = new klass14(text6, this._offset, elements6, labelled3);
              if (typeof type14 === "object") {
                extend(address11, type14);
              }
              this._offset += text6.length;
            } else {
              address11 = null;
            }
            if (address11) {
              elements5.push(address11);
              text5 += address11.textValue;
              remaining2 -= 1;
            }
          }
          if (remaining2 <= 0) {
            this._offset = index8;
            var klass15 = this.constructor.SyntaxNode;
            var type15 = null;
            address10 = new klass15(text5, this._offset, elements5);
            if (typeof type15 === "object") {
              extend(address10, type15);
            }
            this._offset += text5.length;
          } else {
            address10 = null;
          }
          if (address10) {
            elements4.push(address10);
            text4 += address10.textValue;
            labelled2.arg = address10;
            var address14 = null;
            var slice16 = null;
            if (this._input.length > this._offset) {
              slice16 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice16 = null;
            }
            if (slice16 && /^["]/.test(slice16)) {
              var klass16 = this.constructor.SyntaxNode;
              var type16 = null;
              address14 = new klass16(slice16, this._offset, []);
              if (typeof type16 === "object") {
                extend(address14, type16);
              }
              this._offset += 1;
            } else {
              address14 = null;
              var slice17 = null;
              if (this._input.length > this._offset) {
                slice17 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice17 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\"]"};
              }
            }
            if (address14) {
              elements4.push(address14);
              text4 += address14.textValue;
              var address15 = null;
              var remaining3 = 0, index11 = this._offset, elements7 = [], text7 = "", address16 = true;
              while (address16) {
                var slice18 = null;
                if (this._input.length > this._offset) {
                  slice18 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice18 = null;
                }
                if (slice18 && /^[\s]/.test(slice18)) {
                  var klass17 = this.constructor.SyntaxNode;
                  var type17 = null;
                  address16 = new klass17(slice18, this._offset, []);
                  if (typeof type17 === "object") {
                    extend(address16, type17);
                  }
                  this._offset += 1;
                } else {
                  address16 = null;
                  var slice19 = null;
                  if (this._input.length > this._offset) {
                    slice19 = this._input.substring(this._offset, this._offset + 1);
                  } else {
                    slice19 = null;
                  }
                  if (!this.error || this.error.offset <= this._offset) {
                    this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\\s]"};
                  }
                }
                if (address16) {
                  elements7.push(address16);
                  text7 += address16.textValue;
                  remaining3 -= 1;
                }
              }
              if (remaining3 <= 0) {
                this._offset = index11;
                var klass18 = this.constructor.SyntaxNode;
                var type18 = null;
                address15 = new klass18(text7, this._offset, elements7);
                if (typeof type18 === "object") {
                  extend(address15, type18);
                }
                this._offset += text7.length;
              } else {
                address15 = null;
              }
              if (address15) {
                elements4.push(address15);
                text4 += address15.textValue;
              } else {
                elements4 = null;
                this._offset = index7;
              }
            } else {
              elements4 = null;
              this._offset = index7;
            }
          } else {
            elements4 = null;
            this._offset = index7;
          }
        } else {
          elements4 = null;
          this._offset = index7;
        }
        if (elements4) {
          this._offset = index7;
          var klass19 = this.constructor.SyntaxNode;
          var type19 = null;
          address0 = new klass19(text4, this._offset, elements4, labelled2);
          if (typeof type19 === "object") {
            extend(address0, type19);
          }
          this._offset += text4.length;
        } else {
          address0 = null;
        }
        if (address0) {
        } else {
          this._offset = index1;
          var index12 = this._offset, elements8 = [], labelled4 = {}, text8 = "";
          var address17 = null;
          var remaining4 = 1, index13 = this._offset, elements9 = [], text9 = "", address18 = true;
          while (address18) {
            var slice20 = null;
            if (this._input.length > this._offset) {
              slice20 = this._input.substring(this._offset, this._offset + 1);
            } else {
              slice20 = null;
            }
            if (slice20 && /^[^\s]/.test(slice20)) {
              var klass20 = this.constructor.SyntaxNode;
              var type20 = null;
              address18 = new klass20(slice20, this._offset, []);
              if (typeof type20 === "object") {
                extend(address18, type20);
              }
              this._offset += 1;
            } else {
              address18 = null;
              var slice21 = null;
              if (this._input.length > this._offset) {
                slice21 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice21 = null;
              }
              if (!this.error || this.error.offset <= this._offset) {
                this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[^\\s]"};
              }
            }
            if (address18) {
              elements9.push(address18);
              text9 += address18.textValue;
              remaining4 -= 1;
            }
          }
          if (remaining4 <= 0) {
            this._offset = index13;
            var klass21 = this.constructor.SyntaxNode;
            var type21 = null;
            address17 = new klass21(text9, this._offset, elements9);
            if (typeof type21 === "object") {
              extend(address17, type21);
            }
            this._offset += text9.length;
          } else {
            address17 = null;
          }
          if (address17) {
            elements8.push(address17);
            text8 += address17.textValue;
            labelled4.arg = address17;
            var address19 = null;
            var remaining5 = 0, index14 = this._offset, elements10 = [], text10 = "", address20 = true;
            while (address20) {
              var slice22 = null;
              if (this._input.length > this._offset) {
                slice22 = this._input.substring(this._offset, this._offset + 1);
              } else {
                slice22 = null;
              }
              if (slice22 && /^[\s]/.test(slice22)) {
                var klass22 = this.constructor.SyntaxNode;
                var type22 = null;
                address20 = new klass22(slice22, this._offset, []);
                if (typeof type22 === "object") {
                  extend(address20, type22);
                }
                this._offset += 1;
              } else {
                address20 = null;
                var slice23 = null;
                if (this._input.length > this._offset) {
                  slice23 = this._input.substring(this._offset, this._offset + 1);
                } else {
                  slice23 = null;
                }
                if (!this.error || this.error.offset <= this._offset) {
                  this.error = this.constructor.lastError = {input: this._input, offset: this._offset, expected: "[\\s]"};
                }
              }
              if (address20) {
                elements10.push(address20);
                text10 += address20.textValue;
                remaining5 -= 1;
              }
            }
            if (remaining5 <= 0) {
              this._offset = index14;
              var klass23 = this.constructor.SyntaxNode;
              var type23 = null;
              address19 = new klass23(text10, this._offset, elements10);
              if (typeof type23 === "object") {
                extend(address19, type23);
              }
              this._offset += text10.length;
            } else {
              address19 = null;
            }
            if (address19) {
              elements8.push(address19);
              text8 += address19.textValue;
            } else {
              elements8 = null;
              this._offset = index12;
            }
          } else {
            elements8 = null;
            this._offset = index12;
          }
          if (elements8) {
            this._offset = index12;
            var klass24 = this.constructor.SyntaxNode;
            var type24 = null;
            address0 = new klass24(text8, this._offset, elements8, labelled4);
            if (typeof type24 === "object") {
              extend(address0, type24);
            }
            this._offset += text8.length;
          } else {
            address0 = null;
          }
          if (address0) {
          } else {
            this._offset = index1;
          }
        }
      }
      return this._nodeCache["argument"][index0] = address0;
    }
  };
  
  var Parser = function(input) {
    this._input = input;
    this._offset = 0;
    this._nodeCache = {};
  };
  
  Parser.prototype.parse = function() {
    var result = this.__consume__root();
    if (result && this._offset === this._input.length) {
      return result;
    }
    if (!(this.error)) {
      this.error = {input: this._input, offset: this._offset, expected: "<EOF>"};
    }
    var message = formatError(this.error);
    var error = new Error(message);
    throw error;
  };
  
  Parser.parse = function(input) {
    var parser = new Parser(input);
    return parser.parse();
  };
  
  extend(Parser.prototype, Grammar);
  
  var SyntaxNode = function(textValue, offset, elements, properties) {
    this.textValue = textValue;
    this.offset    = offset;
    this.elements  = elements || [];
    if (!properties) return;
    for (var key in properties) this[key] = properties[key];
  };
  
  SyntaxNode.prototype.forEach = function(block, context) {
    for (var i = 0, n = this.elements.length; i < n; i++) {
      block.call(context, this.elements[i], i);
    }
  };
  
  Parser.SyntaxNode = SyntaxNode;
  
  if (typeof require === "function" && typeof exports === "object") {
    exports.Grammar = Grammar;
    exports.Parser  = Parser;
    exports.parse   = Parser.parse;
    
  } else {
    var namespace = this;
    command_parser = Grammar;
    command_parserParser = Parser;
    command_parserParser.formatError = formatError;
  }
})();

