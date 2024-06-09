(async function(Scratch) {
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`"Build" needs to be ran unsandboxed!`);
  }

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

  // Our dynamically added WASM (replaced __wasmOverride with the WASM)
  const WASM = new Uint8Array(/*__wasmOverride*/);

  // Setup object
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

  // Run that WASM!
  WebAssembly.instantiate(WASM, importObject).then((obj) => {
    wasm = obj;
    const __extension = wasm.instance.exports;
    const extension = {
      __ops: ['add'],
      __getInfo: __extension.getInfo,
      getInfo() {
        // For later
        const info = this.__getInfo();
        console.log(info);
        // Return our cheated info
        return {
          id: '0znzwTest',
          name: 'Runs using WASM',
          blocks: [{
            opcode: 'add',
            text: '[_1_A] + [_2_B]',
            arguments: {
              _1_A: {type: 'number'},
              _2_B: {type: 'number'},
            },
            blockType: 'reporter',
          }],
        }
        // return info;
      },
    };
    // Copy the props over
    for (const prop of Object.keys(__extension)) {
      // Skip getInfo
      if (prop !== 'getInfo') {
        // If this is a block just make a wrapper for it
        if (extension.__ops.includes(prop)) {
          const oProp = __extension[prop];
          extension[prop] = function(args) {
            // Just assume its in the correct order :skull:
            return oProp(...Object.values(args));
          }
          // Not a block so we can just assign it :yawn:
        } else extension[prop] = __extension[prop];
      }
    }
    // Register the extension
    Scratch.extensions.register(extension);
  });
})(Scratch);