console.clear();
(async function(Scratch) {
  let wasm;
  // Utilities
  function get_memory() {
    return new Uint8Array(wasm.instance.exports.memory.buffer);
  }
  const decoder = new TextDecoder('utf-8');
  const encoder = new TextEncoder('utf-8');
  function charPtrToString(str) {
    const memory = get_memory();
    let length=0;
    for (; memory[str + length] !== 0 ;++length) {}
    return decoder.decode(memory.subarray(str, str + length));
  }
  function stringToCharPtr(str) {
    const data = encoder.encode(str + '\x00');
    const ptr = wasm.instance.exports.get_memory_for_string(data.length + 1);
    const memory = get_memory();
    memory.subarray(ptr).set(data);
    return ptr;
  }
  function freeCharPtr(ptr) {
    wasm.instance.exports.free_memory_for_string(ptr);
  }

  // WASM
  const WASM = new Uint8Array(/*__wasmOverride*/);

  // Running the WASM
  const importObject = {
    env: {
      print_string: function(str) {
        console.log(charPtrToString(str));
      },
      log(any) {
        console.log(any);
      },
    }
  };
  function readStr(memory, offset, size) {
    let str = '';
    for (let i = 0; i < size; i++) str += String.fromCharCode(memory.getUint8(offset + i));
    return str;
  }
  WebAssembly.instantiate(WASM, importObject).then((obj) => {
    wasm = obj;
    const __extension = wasm.instance.exports;
    const extension = {
      __ops: ['add'],
      __getInfo: __extension.getInfo,
      getInfo() {
        const info = this.__getInfo();
        console.log(info);
        return {
          id: '0znzwTest',
          name: 'test',
          blocks: [{
            opcode: 'add',
            text: 'WASM [A] + [B]',
            arguments: {
              A: {type: 'number'},
              B: {type: 'number'},
            },
            blockType: 'reporter',
          }],
        }
        // return info;
      },
    };
    for (const prop of Object.keys(__extension)) {
      if (prop !== 'getInfo') {
        if (extension.__ops.includes(prop)) {
          const oProp = __extension[prop];
          extension[prop] = function(args) {
            return oProp(...Object.values(args));
          }
        } else extension[prop] = __extension[prop];
      }
    }
    Scratch.extensions.register(extension);
  });
})(Scratch);