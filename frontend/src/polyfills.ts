(window as any).global = window;

import process from 'process/browser';
(window as any).process = process;

import 'crypto-browserify';
import 'stream-browserify';
import 'buffer';
